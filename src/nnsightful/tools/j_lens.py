from __future__ import annotations

from typing import TYPE_CHECKING, Callable, Optional, Any

import torch
from huggingface_hub import HfApi, hf_hub_download

from ..types import JLensData, JLensMeta
from ._base import Tool
from ._utils import IndexSpec

if TYPE_CHECKING:
    from nnterp import StandardizedTransformer

class JLensTool(Tool):
    """Jacobian lens: decode each layer's intermediate predictions.

    Like the logit lens, j-lens reads a model's next-token distribution out of
    every layer — but instead of unembedding a layer's hidden state directly, it
    first maps that state through a per-layer **Jacobian** (a learned linear
    lens) before projecting onto the vocabulary. This yields a per-(layer,
    position) view of the model's evolving top-k predictions and entropy, in the
    same ``LogitLensData`` shape the logit-lens widget renders.

    The Jacobians are per-model checkpoints, not every model has one. They are
    A model without a lens raises ``ValueError`` when run.

    Public methods:
        get_available_lenses: Registry of every model that has a Jacobian lens,
            mapping model name to its ``(repo_id, filename)`` (cached).
        get_lens_config: Resolve one model's lens to ``(repo_id, filename)``,
            raising ``ValueError`` if it has none.
        load_jacobians: Download a lens checkpoint and return its per-layer
            Jacobian tensors.
    """

    NEURON_JLENS_REPO = "neuronpedia/jacobian-lens"
    NEURON_JLENS_SUFFIX = "_jacobian_lens.pt"
    NEURON_JLENS_INDEXING = "J"

    _jacobian_lenses_cache: dict[str, tuple[str, str]] = {}

    # ----- JACOBIANS LOADING ---------------------------------------------

    @classmethod
    def _fetch_neuronpedia_jacobians(cls) -> dict[str, tuple[str, str]]:
        """Fetch, from :attr:`NEURON_JLENS_REPO`, the map of model name to the
        ``(repo_id, filename)`` of its Jacobian-lens checkpoint.

        The key is the segment after the last ``/`` of a model's HF ``repo_id``
        (a lens file's basename is ``<model_name>_jacobian_lens.pt``); ``repo_id``
        is :attr:`NEURON_JLENS_REPO` and ``filename`` is the checkpoint's path
        within it — i.e. the arguments for :meth:`load_jacobians`.

        This hits the network on every call; prefer :meth:`get_available_lenses`
        for the process-lifetime-cached result.
        """
        suffix = cls.NEURON_JLENS_SUFFIX
        neuronpedia_lenses = {
            f.rsplit("/", 1)[-1][: -len(suffix)]: (cls.NEURON_JLENS_REPO, f)
            for f in HfApi().list_repo_files(cls.NEURON_JLENS_REPO)
            if f.endswith(suffix)
        }

        return neuronpedia_lenses

    @classmethod
    def get_available_lenses(cls) -> dict[str, tuple[str, str]]:
        """Return the cached registry of available Jacobian lenses.

        Maps each model name to the ``(repo_id, filename)`` of its lens (see
        :meth:`_fetch_neuronpedia_jacobians` for the shape). The registry is
        fetched once and cached on the class for the process lifetime; clear
        ``_jacobian_lenses_cache`` to force a refresh.
        """
        if not cls._jacobian_lenses_cache:
            cls._jacobian_lenses_cache.update(cls._fetch_neuronpedia_jacobians())

        return cls._jacobian_lenses_cache

    @classmethod
    def get_lens_config(cls, model_repo_id: str) -> tuple[str, str]:
        """Return the ``(repo_id, filename)`` of the Jacobian lens for a model.

        Looks the model up by name (the segment after the last ``/`` of its HF
        ``repo_id``) in :meth:`get_available_lenses`. The returned tuple is ready
        to pass to :meth:`load_jacobians`.

        Raises:
            ValueError: if the model has no corresponding lens.
        """
        lenses = cls.get_available_lenses()
        lens_config = lenses.get(model_repo_id.rsplit("/", 1)[-1])

        if lens_config is None:
            raise ValueError(
                f"No Jacobian lens found for model {model_repo_id!r} in "
                f"{cls.NEURON_JLENS_REPO!r}. Models with a lens: {sorted(lenses)}"
            )

        return lens_config

    @classmethod
    def load_jacobians(
        cls,
        filename: str,
        hf_repo_id: str = NEURON_JLENS_REPO,
        idx: str = NEURON_JLENS_INDEXING,
    ) -> dict[int, torch.Tensor]:
        """Download and load a lens checkpoint's per-layer Jacobians.

        Fetches ``filename`` from ``hf_repo_id`` and returns the ``idx`` entry of
        the checkpoint (a mapping from layer index to Jacobian tensor). The file
        itself is cached on disk by ``hf_hub_download``, but the tensors are
        re-deserialized on each call.
        """

        path = hf_hub_download(hf_repo_id, filename)
        return torch.load(path, map_location="cpu", weights_only=True)[idx]

    # ----- JLENS IMPLEMENTATION ---------------------------------------------

    def _format(
        self,
        logits: torch.Tensor,
        model: StandardizedTransformer,
        top_k: int = 5,
        include_entropy: bool=True,
        results: Optional[dict[Any, Any]]=None,
    ) -> dict[Any, Any]:
        """Format one step's ``[layer, pos, vocab]`` lens logits.

        Overwrites ``logits`` in place (probabilities, then ``p * log p``) so no
        second tensor of this size is allocated. Top-k is ranked on the logits;
        softmax runs per layer with ``dtype`` pinned, since NDIF's autocast would
        otherwise return it in float32. The step's rows are appended to
        ``results`` when given; token labels and ``positions`` are set by
        :meth:`_run`.
        """
        layers = list(range(model.num_layers))

        _, top_indices = torch.topk(logits, k=top_k, dim=-1)

        probs = logits
        for layer_probs in probs:
            layer_probs.copy_(torch.nn.functional.softmax(layer_probs, dim=-1, dtype=layer_probs.dtype))

        # TOP-K
        topks = [[model.tokenizer.batch_decode(torch.tensor(pos).unsqueeze(dim=1)) for pos in layer] for layer in top_indices.tolist()]

        # TRAJECTORIES: trajectories[pos]{token_str: [prob_l0, prob_l1, ...etc]}
        unique_indices = [
            torch.unique(top_indices[:, pi, :].flatten(), sorted=False).tolist()
            for pi in range(top_indices.shape[1])
        ]
        tracked_probs = probs.permute(1, 2, 0)
        trajectories = [{model.tokenizer.decode(token): torch.round(tracked_probs[pos_idx][token].float(), decimals=3).tolist() for token in pos}  for pos_idx, pos in enumerate(unique_indices)]

        # ENTROPY: entropy[l_idx][pos]
        if include_entropy:
            entropy = -probs.xlogy_(probs).sum(dim=-1, dtype=torch.float32)
            entropy = torch.round(entropy, decimals=3).tolist()
        else:
            entropy = None

        step = {
            "meta": {"version": 2, "timestamp": "3h", "model": model.repo_id},
            "layers": layers,
            "tracked": trajectories,
            "topk": topks,
            "entropy": entropy,
        }

        if results is None:
            return step

        results["tracked"].extend(step["tracked"])
        for l_idx in range(len(results["topk"])):
            results["topk"][l_idx].extend(step["topk"][l_idx])
        if results["entropy"] is not None and step["entropy"] is not None:
            for l_idx in range(len(results["entropy"])):
                results["entropy"][l_idx].extend(step["entropy"][l_idx])
        return results

    def _run(
        self,
        model: StandardizedTransformer,
        prompt: str,
        *args,
        positions: IndexSpec=None,
        jacobians: Optional[dict[int, torch.Tensor]]=None,
        max_new_tokens: int=1,
        generate_kwargs: Optional[dict]=None,
        remote: bool=False,
        backend: Optional=None,
        non_blocking=False,
        raw:bool =False,
        post_transform: Optional[Callable]=None,
        **kwargs
    ) -> torch.Tensor|dict[Any, Any]|Any:
        """Run j-lens over ``max_new_tokens`` generation steps.

        The lens is applied at every forward pass of ``model.generate``: the
        prefill pass covers all prompt positions, and each subsequent decode
        pass contributes the one newly generated position. Their per-position
        logits are concatenated so the result spans the whole prompt + generated
        sequence — i.e. ``max_new_tokens=1`` reproduces the old single-pass
        behavior over the prompt.

        ``positions`` (an :data:`~nnsightful.tools._utils.IndexSpec`, default
        all) selects among the *prompt* positions, resolved against the prompt
        length; only those rows of the prefill pass are projected, so its
        buffer scales with the selection. Every generated position is still
        included (one row per decode step). The payload's ``positions`` is then
        the selected prompt indices followed by the generated positions'
        absolute indices (``None`` when ``positions`` is ``None``), and the
        ``raw`` tensor holds the same rows in that order. ``input`` and
        ``completion`` always hold every token.

        When ``jacobians`` is not supplied, the lens for ``model.repo_id`` is
        resolved and loaded automatically (raising ``ValueError`` if the model
        has none). Callers may pass a preloaded ``{layer_index: tensor}`` mapping
        to skip that lookup, extra ``generate_kwargs`` (e.g. sampling options)
        for the generation, and get back the formatted j-lens payload — or, when
        ``remote and non_blocking``, the NDIF job id to poll.

        ``min_new_tokens`` defaults to ``max_new_tokens``: nnsight drops the code
        after a ``tracer.iter`` loop that asks for more steps than the run makes,
        so an early EOS must not cut the run short.

        Raises:
            ValueError: if ``positions`` is empty or outside the prompt.
        """
        prompt_len = len(model.tokenizer.encode(prompt))
        selected = self._select_positions(positions, prompt_len)
        prompt_index = self._position_index(selected)

        # Fresh dict per call — never a shared mutable default, or a previous
        # model's Jacobians would leak into the next call on this singleton.
        if jacobians is None:
            jacobians = {}
        if not jacobians:
            lens_config = JLensTool.get_lens_config(model.repo_id)

        gen_kwargs = {
            "max_new_tokens": max_new_tokens,
            "min_new_tokens": max_new_tokens,
            **(generate_kwargs or {}),
        }

        with torch.no_grad():
            with model.generate(prompt, **gen_kwargs, remote=remote, backend=backend) as tracer:
                if not jacobians:
                    repo_id, filename = lens_config
                    jacobians.update(JLensTool.load_jacobians(filename, repo_id))

                gen_logits = list() #[num_layers, seq, vocab]
                for step in tracer.iter[:gen_kwargs["max_new_tokens"]]:
                    if step == 0 and selected is not None:
                        index, n_rows = prompt_index, len(selected)
                    else:
                        index, n_rows = slice(None), model.input_size[1]
                    step_logits = torch.empty(
                        (model.num_layers, n_rows, model.vocab_size),
                        dtype=model.lm_head.weight.dtype,
                        device=model.lm_head.weight.device,
                    ) # [num_layers, pos, vocab]
                    for l_idx in range(model.num_layers):
                        res = model.layers[l_idx].layer_output[:, index]
                        if l_idx < model.num_layers - 1:
                            jac = jacobians[l_idx].to(device=res.device)
                            res = res @ jac.T.to(res.dtype)
                        step_logits[l_idx] = model.project_on_vocab(res)[0]
                    gen_logits.append(step_logits)

                # Full token sequence (prompt + generated) for position labels.
                output_ids = tracer.result

                if raw:
                    results =  torch.cat([step for step in gen_logits], dim=1).cpu().save() # [layer, pos, vocab]
                else:
                    results = None
                    for step_logits in gen_logits:
                        results = self._format(
                            step_logits, model, results=results, **kwargs
                        )

                    seq_len = prompt_len + len(gen_logits) - 1
                    tokens = [
                        str(model.tokenizer.decode(token))
                        for token in output_ids[0].tolist()[:seq_len]
                    ]
                    results["input"] = tokens[:prompt_len]
                    results["completion"] = tokens[prompt_len:]
                    results["positions"] = (
                        None
                        if selected is None
                        else selected + list(range(prompt_len, seq_len))
                    )

                    results = results.save()

        if remote and non_blocking:
            return backend.job_id

        return results

    @staticmethod
    def to_data_obj(**kwargs):
        meta_dict = kwargs['meta']
        kwargs['meta'] = JLensMeta(**meta_dict)

        return JLensData(**kwargs)


j_lens = JLensTool()
