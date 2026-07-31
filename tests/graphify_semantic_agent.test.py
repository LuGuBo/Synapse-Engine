import pytest
import os
from unittest.mock import patch
from src.agents.graphify_semantic_agent import run_semantic_extraction

def test_run_semantic_extraction_missing_key(tmp_path):
    with patch.dict(os.environ, {}, clear=True):
        with patch("src.agents.graphify_semantic_agent.project_root", str(tmp_path)):
            with pytest.raises(ValueError, match="GEMINI_API_KEY não foi encontrada"):
                run_semantic_extraction()

def test_run_semantic_extraction_success(tmp_path):
    with patch.dict(os.environ, {"GEMINI_API_KEY": "test_key_123"}):
        with patch("src.agents.graphify_semantic_agent.project_root", str(tmp_path)):
            run_semantic_extraction()
