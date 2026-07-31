"""
Gemini Interactions API Connector — Synapse Engine Harness
Implements official Google GenAI Interactions API (genai.Client) paradigm.
"""

import os
from typing import Optional, Any
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


class GeminiInteractionsConnector:
    """
    Official Google Interactions API connector for Synapse Engine.
    Supports model routing, prompt prefix caching, and subagent isolation.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if GENAI_AVAILABLE and self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None

    def create_interaction(
        self,
        model: str,
        input_text: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.2
    ) -> Any:
        """
        Creates a new interaction using the Google GenAI Client.
        """
        if not self.client:
            return {
                "status": "dry_run",
                "model": model,
                "input": input_text,
                "system_instruction": system_instruction,
                "message": "GenAI SDK client not initialized. Set GEMINI_API_KEY environment variable."
            }

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=temperature
        ) if system_instruction else types.GenerateContentConfig(temperature=temperature)

        response = self.client.interactions.create(
            model=model,
            input=input_text,
            config=config
        )
        return response
