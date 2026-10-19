from __future__ import annotations

import pytest


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption(
        "--model-names",
        default="openai-community/gpt2",
        help="Comma-separated HuggingFace model names to test with",
    )
    parser.addoption(
        "--remote",
        action="store_true",
        help="Also run the tests marked `remote` (they submit jobs to NDIF)",
    )


def pytest_configure(config: pytest.Config) -> None:
    config.addinivalue_line(
        "markers",
        "remote: submits jobs to NDIF; skipped unless --remote is given",
    )


def pytest_collection_modifyitems(
    config: pytest.Config, items: list[pytest.Item]
) -> None:
    if config.getoption("remote"):
        return
    skip = pytest.mark.skip(reason="needs --remote (submits jobs to NDIF)")
    for item in items:
        if "remote" in item.keywords:
            item.add_marker(skip)


def pytest_generate_tests(metafunc: pytest.Metafunc) -> None:
    if "model_name" in metafunc.fixturenames:
        names = metafunc.config.getoption("model_names").split(",")
        metafunc.parametrize("model_name", names, scope="session")


_model_cache: dict[str, object] = {}
_failed: set[str] = set()


@pytest.fixture(scope="session")
def model(model_name: str):
    """Session-scoped StandardizedTransformer fixture (cached, skip on load failure).

    The same object runs locally and, in the ``remote`` tests, on NDIF, so
    the model must be hosted there for those.
    """
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
