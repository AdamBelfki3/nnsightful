from __future__ import annotations

import pytest


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption(
        "--model-names",
        default="gpt2",
        help="Comma-separated HuggingFace model names to test with",
    )


def pytest_generate_tests(metafunc: pytest.Metafunc) -> None:
    if "model_name" in metafunc.fixturenames:
        names = metafunc.config.getoption("model_names").split(",")
        metafunc.parametrize("model_name", names, scope="session")


_model_cache: dict[str, object] = {}
_failed: set[str] = set()


@pytest.fixture(scope="session")
def model(model_name: str):
    """Session-scoped StandardizedTransformer fixture (cached, skip on load failure)."""
    if model_name in _failed:
        pytest.skip(f"Model {model_name} failed to load previously")

    if model_name not in _model_cache:
        try:
            from nnterp import StandardizedTransformer

            _model_cache[model_name] = StandardizedTransformer(model_name)
        except Exception as exc:
            _failed.add(model_name)
            pytest.skip(f"Cannot load {model_name}: {exc}")

    return _model_cache[model_name]
