"""
Model Router Module — Synapse Engine Harness
Routingly selects Google Gemini models based on task type, urgency, and subagent role.
"""

from typing import Dict, Any, Optional
from .gemini_interactions import GeminiInteractionsConnector

# Model Identifier Registry
MODELS = {
    "PRIMARY_AGENT": "gemini-3.6-flash",
    "SUBAGENT_ASYNC": "gemini-3.5-flash-lite",
    "REASONING_HEAVY": "gemini-3.1-pro",
    "MULTIMODAL_MEDIA": "gemini-2.5-flash"
}


class ModelRouter:
    """
    Routes subagent execution tasks to specialized models:
    - High-volume async tasks -> gemini-3.5-flash-lite (low latency, high throughput)
    - Primary agent tasks -> gemini-3.6-flash (frontier performance)
    - Heavy architectural design -> gemini-3.1-pro
    """

    def __init__(self, connector: Optional[GeminiInteractionsConnector] = None):
        self.connector = connector or GeminiInteractionsConnector()

    def get_model_for_task(self, task_type: str) -> str:
        """
        Returns the appropriate model string given a task type.
        """
        task_type_lower = task_type.lower()
        if any(keyword in task_type_lower for keyword in ["subagent", "async", "background", "tdd_scan", "defuddle", "linter"]):
            return MODELS["SUBAGENT_ASYNC"]
        elif any(keyword in task_type_lower for keyword in ["architecture", "refactor", "proof", "heavy_reasoning"]):
            return MODELS["REASONING_HEAVY"]
        elif any(keyword in task_type_lower for keyword in ["image", "video", "media"]):
            return MODELS["MULTIMODAL_MEDIA"]
        else:
            return MODELS["PRIMARY_AGENT"]

    def dispatch_task(
        self,
        task_type: str,
        input_text: str,
        system_instruction: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Selects target model and executes interaction via GeminiInteractionsConnector.
        """
        target_model = self.get_model_for_task(task_type)
        response = self.connector.create_interaction(
            model=target_model,
            input_text=input_text,
            system_instruction=system_instruction
        )
        return {
            "task_type": task_type,
            "selected_model": target_model,
            "response": response
        }
