from abc import abstractmethod

from pydantic import BaseModel


class ToolData(BaseModel):
    """Abstract base for nnsightful tool output data."""

    @abstractmethod
    def display(self, **kwargs):
        """Display a visualization of the data."""
        ...


class LogitLensMeta(BaseModel):
    version: int = 2
    timestamp: str
    model: str


class LogitLensData(ToolData):
    meta: LogitLensMeta
    layers: list[int]
    input: list[str]  # Input tokens as strings (always dense, all tokens)
    positions: list[int] | None = None  # Computed position indices; None = all
    tracked: list[dict[str, list[float]]]  # Per-position: token -> trajectory
    topk: list[list[list[str]]]  # [layer][position] -> list of selected tokens
    entropy: list[list[float]] | None = None  # Optional: [layer][position] -> entropy

    def display(self, **kwargs):
        from nnsightful.viz import display_logit_lens

        return display_logit_lens(self, **kwargs)


class ActivationPatchingData(ToolData):
    lines: list[list[float]]  # [token][layer] probabilities
    ranks: list[list[int]]  # [token][layer] ranks
    prob_diffs: list[list[float]]  # [token][layer] prob diffs
    tokenLabels: list[str]  # Token text labels for each line

    def display(self, tokens: list[int] | None = None, **kwargs):
        from nnsightful.viz import display_line_plot

        # Default: show only src_pred and tgt_pred (first 2 lines)
        indices = tokens if tokens is not None else [0, 1]
        sliced = {
            "lines": [self.lines[i] for i in indices],
            "labels": [self.tokenLabels[i] for i in indices],
        }
        if "options" not in kwargs:
            kwargs["options"] = {"mode": "probability"}
        return display_line_plot(sliced, **kwargs)
