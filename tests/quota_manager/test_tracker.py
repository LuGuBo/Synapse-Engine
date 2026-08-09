import pytest
import tempfile
import os
from src.quota_manager.tracker import DynamicQuotaRegistry, QuotaWindowTracker

def test_tracker_initialization():
    registry = DynamicQuotaRegistry()
    assert registry is not None

def test_tracker_record_usage():
    with tempfile.TemporaryDirectory() as tmpdir:
        storage_path = os.path.join(tmpdir, "quota_logs.json")
        tracker = QuotaWindowTracker(storage_path=storage_path)
        tracker.record_usage("gemini-3.1-flash", input_tokens=100, output_tokens=50)
        usage = tracker.get_sliding_window_usage("gemini-3.1-flash")
        assert usage["rpd_24h"] >= 1
