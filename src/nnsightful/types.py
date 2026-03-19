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
        # Default: show only src_pred and tgt_pred (first 2 lines)
        n = len(self.lines)
        indices = tokens if tokens is not None else list(range(min(2, n)))
        indices = [i for i in indices if i < n]
        sliced = {
            "lines": [self.lines[i] for i in indices],
            "ranks": [self.ranks[i] for i in indices],
            "prob_diffs": [self.prob_diffs[i] for i in indices],
            "tokenLabels": [self.tokenLabels[i] for i in indices],
        }
        result = display_activation_patching(sliced, **kwargs)
        if return_fig:
            return result
