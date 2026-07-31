import pytest
from src.connectors.model_router import ModelRouter, MODELS

def test_model_router_connectors_mapping():
    router = ModelRouter()
    assert router.select_model("REASONING_HEAVY") == MODELS["REASONING_HEAVY"]
    assert router.select_model("UNKNOWN") == MODELS["PRIMARY_AGENT"]
