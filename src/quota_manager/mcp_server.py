from typing import Dict, Any, Optional
from .tracker import DynamicQuotaRegistry, QuotaWindowTracker
from .estimator import TaskWeightEstimator


class QuotaMCPServer:
    """
    Exposes Quota Manager and Task Weight Estimator functionality for Synapse MCP Stdio Server.
    """

    def __init__(self):
        self.registry = DynamicQuotaRegistry()
        self.tracker = QuotaWindowTracker()
        self.estimator = TaskWeightEstimator(self.registry, self.tracker)

    def get_quota_status(self) -> Dict[str, Any]:
        result = {}
        for model_id in ["gemini-3.1-flash-lite", "gemini-2.5-flash-lite", "gemini-3.1-flash", "gemini-2.5-flash", "gemini-3.1-pro"]:
            info = self.registry.get_model_info(model_id) or {}
            usage = self.tracker.get_sliding_window_usage(model_id)
            result[model_id] = {
                "name": info.get("raw_name", model_id),
                "is_available": info.get("is_available", True),
                "status": info.get("status_str", "Ativo"),
                "rpd_limit": info.get("rpd_limit", 0),
                "rpd_used_24h": usage["rpd_24h"],
                "rpm_limit": info.get("rpm_limit", 0),
                "rpm_used_60s": usage["rpm_60s"],
                "tpm_limit": info.get("tpm_limit", 0),
                "tpm_used_60s": usage["tpm_60s"]
            }
        return {"status": "ok", "models": result}

    def estimate_task_weight(
        self,
        task_description: str,
        active_persona: str = "DEVELOPER",
        ast_connected_nodes: int = 0
    ) -> Dict[str, Any]:
        return self.estimator.estimate(
            task_description=task_description,
            active_persona=active_persona,
            ast_connected_nodes=ast_connected_nodes
        )
