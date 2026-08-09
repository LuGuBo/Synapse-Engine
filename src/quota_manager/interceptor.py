from typing import Dict, Any, Optional, Tuple
from .tracker import DynamicQuotaRegistry, QuotaWindowTracker
from .estimator import TaskWeightEstimator


class QuotaInterceptor:
    """
    Quota Interceptor for Synapse Engine.
    Intercepts AI model execution requests before dispatching them to LLM providers,
    verifying model availability, task weight classification, and safety thresholds to prevent 429 errors.
    """

    def __init__(self):
        self.registry = DynamicQuotaRegistry()
        self.tracker = QuotaWindowTracker()
        self.estimator = TaskWeightEstimator(self.registry, self.tracker)

    def intercept_request(
        self,
        task_description: str,
        requested_model: Optional[str] = None,
        active_persona: str = "DEVELOPER",
        ast_connected_nodes: int = 0
    ) -> Dict[str, Any]:

        estimation = self.estimator.estimate(
            task_description=task_description,
            active_persona=active_persona,
            ast_connected_nodes=ast_connected_nodes
        )

        final_model = requested_model or estimation["selected_model"]

        # Verifica disponibilidade
        available, msg = self.registry.is_model_available(final_model)
        if not available:
            final_model = estimation["selected_model"]

        # Registra intenção de uso prévio
        window_usage = self.tracker.get_sliding_window_usage(final_model)

        return {
            "allowed": True,
            "recommended_model": final_model,
            "weight_score": estimation["weight_score"],
            "tier_label": estimation["tier_label"],
            "reasons": estimation["evaluation_reasons"],
            "window_usage": window_usage
        }

    def record_completed_request(
        self,
        model_name: str,
        input_tokens: int = 0,
        output_tokens: int = 0,
        is_error: bool = False
    ) -> None:
        self.tracker.record_usage(
            model_name=model_name,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            is_error=is_error
        )
