"""nnsightful: a higher-level extension of NNsight for mechanistic interpretability."""

from nnsightful.tools import activation_patching, logit_lens
from nnsightful.tools._utils import IndexSpec, resolve_indices
from nnsightful.types import (
    ActivationPatchingData,
    LogitLensData,
    LogitLensMeta,
)
from nnsightful.viz import display_line_plot, display_logit_lens

__all__ = [
    "activation_patching",
    "logit_lens",
    "IndexSpec",
    "resolve_indices",
    "ActivationPatchingData",
    "LogitLensData",
    "LogitLensMeta",
    "display_line_plot",
    "display_logit_lens",
]
