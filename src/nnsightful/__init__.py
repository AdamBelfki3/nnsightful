"""nnsightful: a higher-level extension of NNsight for mechanistic interpretability."""

from nnsightful.tools._base import Tool
from nnsightful.tools._utils import IndexSpec, resolve_indices
from nnsightful.tools.activation_patching import activation_patching
from nnsightful.tools.j_lens import j_lens
from nnsightful.tools.logit_lens import logit_lens
from nnsightful.types import (
    ActivationPatchingData,
    JLensData,
    JLensMeta,
    LogitLensData,
    LogitLensMeta,
    ToolData,
)
from nnsightful.viz import (
    display_activation_patching,
    display_heatmap_table,
    display_j_lens,
    display_line_plot,
    display_logit_lens,
)

from nnsight import ndif

ndif.register('nnsightful')

__all__ = [
    "activation_patching",
    "j_lens",
    "logit_lens",
    "Tool",
    "ToolData",
    "IndexSpec",
    "resolve_indices",
    "ActivationPatchingData",
    "JLensData",
    "JLensMeta",
    "LogitLensData",
    "LogitLensMeta",
    "display_activation_patching",
    "display_heatmap_table",
    "display_j_lens",
    "display_line_plot",
    "display_logit_lens",
]
