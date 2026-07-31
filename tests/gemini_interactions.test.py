import pytest
import os
from unittest.mock import patch, MagicMock
from src.connectors.gemini_interactions import GeminiInteractionsConnector

def test_gemini_interactions_init_missing_key(tmp_path):
    with patch.dict(os.environ, {}, clear=True):
        with pytest.raises(ValueError, match="GEMINI_API_KEY não foi encontrada"):
            GeminiInteractionsConnector()

def test_gemini_interactions_init_success():
    with patch.dict(os.environ, {"GEMINI_API_KEY": "dummy_key_abc"}):
        connector = GeminiInteractionsConnector()
        assert connector.api_key == "dummy_key_abc"
