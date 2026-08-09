import pytest
from src.quota_manager.estimator import TaskWeightEstimator

def test_estimator_weights():
    estimator = TaskWeightEstimator()
    res = estimator.estimate("Write unit test for quota manager", active_persona="DEVELOPER", ast_connected_nodes=5)
    assert "weight_score" in res
    assert 1 <= res["weight_score"] <= 10
