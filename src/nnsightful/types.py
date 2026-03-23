from pydantic import BaseModel


class LogitLensMeta(BaseModel):
    version: int = 2
    timestamp: str
    model: str

class LogitLensData(BaseModel):
    meta: LogitLensMeta
    layers: list[int]
    input: list[str]  # Input tokens as strings
    tracked: list[dict[str, list[float]]]  # Per-position: token -> trajectory
    topk: list[list[list[str]]]  # [layer][position] -> list of top-k tokens
    entropy: list[list[float]] | None = None  # Optional: [layer][position] -> entropy

    def display(self, return_fig: bool = False, **kwargs):
        from nnsightful.viz import display_logit_lens
        result = display_logit_lens(self, **kwargs)
        if return_fig:
            return result


# class ActivationsPatchingMeta(BaseModel):
#     version: int = 1
#     timestamp: str
#     model: str

class ActivationPatchingData(BaseModel):
    # meta: ActivationsPatchingMeta
    lines: list[list[float]]  # Each inner list is probabilities for one token across all layers
    ranks: list[list[int]]  # Each inner list is ranks for one token across all layers
    prob_diffs: list[list[float]]  # Each inner list is probability differences for one token across all layers
    tokenLabels: list[str]  # Token text labels for each line

    def display(self, tokens: list[int] | None = None, return_fig: bool = False, **kwargs):
        from nnsightful.viz import display_activation_patching
        # Pass all data to the widget — the built-in token selector lets the user
        # choose which tokens to display. `tokens` controls the initial selection.
        data = self.model_dump()
        n = len(self.lines)
        selected = tokens if tokens is not None else list(range(min(2, n)))
        selected = [i for i in selected if i < n]
        options = kwargs.pop("options", {}) or {}
        options["selectedTokens"] = selected
        result = display_activation_patching(data, options=options, **kwargs)
        if return_fig:
            return result
