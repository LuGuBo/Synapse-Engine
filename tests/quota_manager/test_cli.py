import pytest
from src.quota_manager.cli import main

def test_cli_import():
    assert callable(main)
