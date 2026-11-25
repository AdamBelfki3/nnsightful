"""The tools on looped, block-residual transformers.

Thinking Machines Lab's Inkling 2 Mini and TML-d24-varloop-research are not
the single residual stream the other tools are written against, and nnterp
does not standardize them. This module holds everything nnsightful needs to
run on them: the model wrapper, :class:`LoopedTransformer`, and the logit lens
and activation patching written for it, which a call to
:data:`~nnsightful.logit_lens` or :data:`~nnsightful.activation_patching` with
such a model runs instead of its own (see
:class:`~nnsightful.tools._base.Tool`)::

    model = LoopedTransformer("thinkingmachines/Inkling-2-Mini")
    data = logit_lens(model, prompt, exec_mode=ExecMode.REMOTE)

Two things set these models apart:

* **The loop.** The middle layers run several times over the same weights, so
  a forward makes more layer *visits* than the model has layers: Inkling 2
  Mini's 24 layers make 48, layers 6 to 17 running three times. The tools
  count visits where they count layers elsewhere: a lens row or a patching
  point is a visit.
* **Block residuals.** A layer adds to the *active block*, the running sum of
  its group of six layers, which starts over at every sixth layer; the sums
  already finished are kept as a list of *completed blocks*, and every
  sublayer reads its own mixture of them. A pass after the first restarts
  from the state the layers before the loop left, and sees the previous pass
  only through messages its layers read from that pass's two blocks.

So the state at a visit is several tensors, not one: the lens mixes them the
way the model does before its head, and patching overwrites all of them, or
on request the active block alone (``patch="output"``).
"""

from __future__ import annotations

from collections.abc import Iterator
from typing import Any

import torch
import torch.nn.functional as F
from nnsight import TransformersModel

from ..types import ActivationPatchingData, PlotSection
from .activation_patching import ActivationPatchingTool
from .logit_lens import LogitLensTool


class LoopedLogitLensTool(LogitLensTool):
    """The logit lens over a looped model's layer visits."""

    def _run(
        self,
        model: LoopedTransformer,
        *,
        prompt: str,
        positions: list[int] | None,
        index: slice | list[int],
    ) -> dict[str, Any]:
        """Project the ``positions`` rows (via ``index``) of every visit.

        The logits are float32, as the model's own are.
        """
        with model.trace(prompt) as tracer:
            logits = None
            for visit in range(model.num_layers):
                hidden, blocks = model.visit_output(tracer, visit)
                visit_logits = model.project_on_vocab(
                    hidden[:, index], blocks[:, index]
                )[0]
                if logits is None:
                    logits = torch.empty(
                        (model.num_layers, *visit_logits.shape),
                        dtype=visit_logits.dtype,
                        device=visit_logits.device,
                    )  # [num_visits, pos, vocab]
                logits[visit] = visit_logits

        return {"logits": logits}


class LoopedActivationPatchingTool(ActivationPatchingTool):
    """Activation patching over a looped model's layer visits.

    A visit is patched one of two ways, chosen by ``patch``:

    * ``"state"`` (the default) replaces, at the patched positions, the whole
      state the visit leaves (:meth:`LoopedTransformer.state`), so that
      everything computed there afterwards starts from the source run's.
      Once the loop has begun that includes the state later passes restart
      from, which is replaced where each picks it up
      (:meth:`LoopedTransformer.restart_visits`). Patching every position at
      a visit gives back the source run's output.
    * ``"output"`` replaces only what the visit's layer returns, the active
      block (:meth:`LoopedTransformer.active_block`). The completed blocks,
      the token's embedding among them, stay the target run's, so the patch
      carries what the current group of layers has written so far and
      nothing else.

    Frozen positions are held at the clean run's whole state under both.
    The data carries the model's sections
    (:attr:`LoopedTransformer.sections`), so its plot marks the loop's passes.

    Attributes:
        PATCHES: The values ``patch`` takes, the default first.
    """

    PATCHES = ("state", "output")

    def _prepare(
        self, model: LoopedTransformer, *args: Any, patch: str = PATCHES[0], **kwargs: Any
    ) -> tuple[dict[str, Any], dict[str, Any]]:
        """Resolve the call's arguments, ``patch`` among them (see :attr:`PATCHES`)."""
        if patch not in self.PATCHES:
            raise ValueError(f"patch={patch!r} is not one of {self.PATCHES}.")

        run_kwargs, format_kwargs = super()._prepare(model, *args, **kwargs)
        return {**run_kwargs, "patch": patch}, format_kwargs

    def _run(
        self,
        model: LoopedTransformer,
        *,
        src_prompt: str,
        tgt_prompt: str,
        src_pos: list[int | list[int]],
        tgt_pos: list[int],
        tgt_freeze: list[int],
        batch_size: int,
        patch: str,
    ) -> dict[str, Any]:
        """Patch each visit of the source run into the target run.

        Collects from the source run what ``patch`` writes at each visit, and
        both runs' predictions, then patches visit by visit in batches of
        ``batch_size`` invokes. These models' numbers shift a little with the
        batch they run in, so the patched runs match a lone run exactly only
        with ``batch_size=1``.
        """
        num_visits = model.num_layers

        sources = []
        with model.trace(src_prompt) as tracer:
            for visit in range(num_visits):
                tensors = self._patched(model, tracer, visit, patch)
                sources.append([self._gather(t, src_pos) for t in tensors])

            src_pred = model.logits[0, -1].argmax(dim=-1)

        clean_states = []
        with model.trace(tgt_prompt) as tracer:
            if tgt_freeze:
                for visit in range(num_visits):
                    state = model.state(tracer, visit)
                    clean_states.append([t[0, tgt_freeze] for t in state])

            clean_pred = model.logits[0, -1].argmax(dim=-1)
            clean_probs = F.softmax(model.logits[0, -1], dim=-1)

        patched_logits = []
        for batch_start in range(0, num_visits, batch_size):
            batch_end = min(batch_start + batch_size, num_visits)
            with model.trace() as tracer:
                for visit in range(batch_start, batch_end):
                    with tracer.invoke(tgt_prompt):
                        restarts = model.restart_visits(visit) if patch == "state" else []
                        self._write(
                            self._patched(model, tracer, visit, patch),
                            (tgt_pos, sources[visit]),
                        )

                        for later in range(visit + 1, num_visits):
                            edits = []
                            if later in restarts:
                                restart = sources[later]
                                kept = [None] * (len(restart) - 2)
                                edits.append((tgt_pos, kept + restart[-2:]))
                            if tgt_freeze:
                                edits.append((tgt_freeze, clean_states[later]))
                            if edits:
                                self._write(model.state(tracer, later), *edits)

                        patched_logits.append(model.logits[0, -1])

        return {
            "src_pred": src_pred,
            "clean_pred": clean_pred,
            "patched_logits": patched_logits,
            "clean_probs": clean_probs,
        }

    def _format(
        self, model: LoopedTransformer, outputs: dict[str, Any]
    ) -> ActivationPatchingData:
        return self.format(**self._raw(model, outputs))

    def _raw(self, model: LoopedTransformer, outputs: dict[str, Any]) -> dict[str, Any]:
        """The arguments of :meth:`format`: the run's outputs, the tokenizer and the model's sections.

        Written out rather than extended from the base tool's: it runs inside
        the session, and a remote run's copy of a method has no ``super()``.
        """
        return {"tokenizer": model.tokenizer, "sections": model.sections, **outputs}

    @staticmethod
    def _patched(
        model: LoopedTransformer, tracer: Any, visit: int, patch: str
    ) -> Iterator[torch.Tensor]:
        """The tensors ``patch`` overwrites at a visit, each as the model reaches it."""
        if patch == "output":
            yield model.active_block(tracer, visit)
        else:
            yield from model.state(tracer, visit)

    @staticmethod
    def _gather(tensor: torch.Tensor, positions: list[int | list[int]]) -> torch.Tensor:
        """A state tensor's rows at ``positions``, a ``[start, end)`` range averaged."""
        rows = []
        for pos in positions:
            if isinstance(pos, list):
                rows.append(tensor[0, pos[0] : pos[1]].mean(dim=0))
            else:
                rows.append(tensor[0, pos])
        return torch.stack(rows)  # [pos, ...]

    @staticmethod
    def _write(
        state: Iterator[torch.Tensor],
        *edits: tuple[list[int], list[torch.Tensor | None]],
    ) -> None:
        """Overwrite rows of a state's tensors in place, each as the model reaches it.

        An edit is the positions to overwrite and, for each of the state's
        tensors, their new rows (``None`` leaves that tensor alone). A tensor
        is written before the next one is asked for, so that what the model
        computes in between already reads the edit.
        """
        for i, tensor in enumerate(state):
            for positions, values in edits:
                if values[i] is not None:
                    tensor[0, positions] = values[i]


class LoopedTransformer(TransformersModel):
    """A looped, block-residual transformer, with what the tools read off a model.

    Loads Inkling 2 Mini and TML-d24-varloop-research (see :attr:`MODEL_TYPES`)
    as nnsight's ``TransformersModel`` and adds the names nnsightful's tools
    and formatters use on any model (``num_layers``, ``vocab_size``,
    ``logits``, ``project_on_vocab``), counted and read the way these models
    need (see the module docstring), and the accessors the looped tools read
    and patch the state through (:meth:`visit_output`, :meth:`active_block`,
    :meth:`state`).

    The loop's shape is read off the running model's config, so on NDIF it is
    the deployment's: a variable-loop checkpoint runs the number of passes it
    is hosted with.

    Args:
        repo_id: A HuggingFace repo id, or an already-loaded module.
        **kwargs: Passed through to ``TransformersModel``. ``task`` defaults
            to :attr:`TASK`, the one these checkpoints load (and are hosted
            on NDIF) under; a text prompt needs nothing else.

    Attributes:
        MODEL_TYPES: The ``model_type`` of the configs this class loads.
        TASK: The pipeline task the checkpoints are loaded under.
        TOOLS: The tools' implementations for this model, by the class of the
            tool they stand in for.
    """

    MODEL_TYPES = frozenset({"inkling2_loop"})
    TASK = "image-text-to-text"
    TOOLS = {
        LogitLensTool: LoopedLogitLensTool(),
        ActivationPatchingTool: LoopedActivationPatchingTool(),
    }

    def __init__(self, repo_id: Any, *args: Any, **kwargs: Any) -> None:
        kwargs.setdefault("task", self.TASK)
        super().__init__(repo_id, *args, **kwargs)

    @classmethod
    def supports(cls, config: Any) -> bool:
        """Whether ``config``, a checkpoint's own, is of a model this class loads."""
        return getattr(config, "model_type", None) in cls.MODEL_TYPES

    # -- the loop -----------------------------------------------------------------

    @property
    def decoder(self) -> Any:
        """The language model: its ``layers`` and what mixes their blocks."""
        return self.model.language_model

    @property
    def visits(self) -> list[tuple[int, int]]:
        """Every layer visit of a forward, in order, as ``(layer, pass)``."""
        config = self.decoder.config
        loop = range(config.loop_layer_index_start, config.loop_layer_index_end)
        return [
            *((layer, 0) for layer in range(loop.start)),
            *((layer, p) for p in range(config.loop_num_passes) for layer in loop),
            *((layer, 0) for layer in range(loop.stop, config.num_hidden_layers)),
        ]

    @property
    def sections(self) -> list[PlotSection]:
        """The spans of the visit axis a plot marks.

        The layers before the loop (``prelude``), each pass over the loop's
        layers, and the layers after it (``coda``), in order, with a divider
        wherever a group of layers starts a new block inside one.
        """
        config = self.decoder.config
        block = config.n_layers_per_attn_res_block
        loop = range(config.loop_layer_index_start, config.loop_layer_index_end)
        spans = [
            ("prelude", range(loop.start)),
            *((f"pass {p + 1}", loop) for p in range(config.loop_num_passes)),
            ("coda", range(loop.stop, config.num_hidden_layers)),
        ]

        sections, visit = [], 0
        for label, layers in spans:
            if not layers:
                continue
            starts = [visit + i for i, layer in enumerate(layers) if i and layer % block == 0]
            end = visit + len(layers) - 1
            sections.append(PlotSection(start=visit, end=end, label=label, dividers=starts))
            visit = end + 1
        return sections

    @property
    def num_layers(self) -> int:
        """The number of layer visits, which the tools index as layers."""
        return self.decoder.config.total_num_hidden_layers

    @property
    def vocab_size(self) -> int:
        return self.lm_head.weight.shape[0]

    def restart_visits(self, visit: int) -> list[int]:
        """The visits after ``visit`` that hand a pass the state it restarts from.

        A pass after the first restarts from the state the layers before the
        loop left, which the last visit of the pass before it hands over (the
        last two tensors of its :meth:`state`). Nothing ``visit`` computes
        reaches that state once the loop has begun, so replacing what
        ``visit`` leaves means replacing it at these visits too. Empty for a
        visit the loop has not begun at, or that no pass restarts after.
        """
        config = self.decoder.config
        loop_start = config.loop_layer_index_start
        loop_len = config.loop_layer_index_end - loop_start
        if visit < loop_start - 1:
            return []
        restarting = range(config.loop_num_passes - 1)
        pass_ends = [loop_start + (p + 1) * loop_len - 1 for p in restarting]
        return [end for end in pass_ends if end > visit]

    # -- the state (inside a trace) -------------------------------------------------

    @property
    def logits(self) -> torch.Tensor:
        """The logits the model returns, ``[batch, seq, vocab_size]``, softcapped."""
        return self.output.logits

    def visit_output(
        self, tracer: Any, visit: int
    ) -> tuple[torch.Tensor, torch.Tensor]:
        """What a visit leaves to read: its active block and the completed blocks.

        ``[batch, seq, hidden]`` and ``[batch, seq, blocks, hidden]``. A layer
        that starts a block completes the one it was handed.
        """
        layer_idx, pass_idx = self.visits[visit]
        layer = self.decoder.layers[layer_idx]
        for _ in tracer.iter[pass_idx]:
            hidden, blocks = layer.inputs[0][:2]
            output = layer.output
        if layer.is_block_boundary:
            blocks = torch.cat([blocks.to(hidden.device), hidden.unsqueeze(-2)], dim=-2)
        return output, blocks

    def active_block(self, tracer: Any, visit: int) -> torch.Tensor:
        """The active block a visit leaves, to read or edit in place.

        What the visit's layer returns, ``[batch, seq, hidden]``: the running
        sum of its group of layers. It is one tensor of the :meth:`state` the
        visit leaves; the completed blocks are not part of it.
        """
        layer_idx, pass_idx = self.visits[visit]
        for _ in tracer.iter[pass_idx]:
            output = self.decoder.layers[layer_idx].output
        return output

    def state(self, tracer: Any, visit: int) -> Iterator[torch.Tensor]:
        """The tensors that hold the state a visit leaves, to read or edit in place.

        They are what runs next is called with: the active block and the
        completed blocks handed to the next visit's layer or, after the last
        visit, to the mix the head reads. In a pass after the first, the two
        blocks of the previous pass come ahead of them: the rest of the pass
        reads its messages from those. Each is ``[batch, seq, ...]``, and the
        last two are always the active block and the completed blocks.

        The last visit of a pass leaves the next pass its two blocks, and the
        state that pass restarts from (see :meth:`restart_visits`).

        Yields each tensor as the model reaches it, so edit one before taking
        the next: the next layer's messages are computed from the previous
        pass's blocks before the layer is handed the rest.
        """
        decoder = self.decoder
        if visit + 1 == self.num_layers:
            blocks, hidden = decoder.final_input.inputs[0][:2]
            yield hidden
            yield blocks
            return

        config = decoder.config
        layer_idx, pass_idx = self.visits[visit + 1]
        if pass_idx > 0:
            loop_len = config.loop_layer_index_end - config.loop_layer_index_start
            call = (pass_idx - 1) * loop_len + layer_idx - config.loop_layer_index_start
            for _ in tracer.iter[call]:
                previous = decoder.message_input.inputs[0][:2]
            yield from previous
        for _ in tracer.iter[pass_idx]:
            hidden, blocks = decoder.layers[layer_idx].inputs[0][:2]
        yield hidden
        yield blocks

    def project_on_vocab(
        self, hidden: torch.Tensor, blocks: torch.Tensor
    ) -> torch.Tensor:
        """Logits for the state a visit leaves: the logit lens.

        Mixes the active block with the completed blocks as the model does
        before its head, then applies the final norm, ``lm_head`` and the
        logit softcap. Applied to the last visit's, it is :attr:`logits`.
        """
        decoder = self.decoder
        mixed = decoder.norm(decoder.final_input(blocks, hidden)[0])
        logits = self.lm_head(mixed.to(self.lm_head.weight.dtype)).float()
        return self.logit_softcap(logits)

    # -- remote ---------------------------------------------------------------------

    def _remoteable_class(self) -> type:
        """The class in this model's remote key: what a server deploys."""
        return TransformersModel
