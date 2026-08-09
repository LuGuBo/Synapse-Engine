import re
from typing import Dict, Any, Optional
from .tracker import DynamicQuotaRegistry, QuotaWindowTracker


class TaskWeightEstimator:
    """
    Task Weight Estimator for Synapse Engine.
    Estimates the complexity weight of a software development task on a 1-10 scale and selects
    the optimal AI model based on task weight, live GCP model availability, and sliding window quota budgets.
    """

    def __init__(self, registry: Optional[DynamicQuotaRegistry] = None, tracker: Optional[QuotaWindowTracker] = None):
        self.registry = registry or DynamicQuotaRegistry()
        self.tracker = tracker or QuotaWindowTracker()

    def estimate(
        self,
        task_description: str,
        active_persona: str = "DEVELOPER",
        ast_connected_nodes: int = 0,
        payload_size_kb: float = 0.0,
        surgical_lines_affected: int = 0
    ) -> Dict[str, Any]:

        desc_lower = task_description.lower()
        base_score = 1.0
        reasons = []

        # 1. Avaliação por palavras-chave do tipo de tarefa
        if any(w in desc_lower for w in ["test", "tdd", "unit test", "lint", "format", "typo", "docstring", "status", "telemetry"]):
            base_score += 0.5
            reasons.append("Task type: Fast-path test / validation / telemetry")
        elif any(w in desc_lower for w in ["ui", "component", "style", "css", "feature", "endpoint", "bugfix", "patch"]):
            base_score += 2.5
            reasons.append("Task type: Standard feature / UI component / bugfix")
        elif any(w in desc_lower for w in ["refactor", "ast", "schema", "database", "migration", "graph", "threat"]):
            base_score += 5.0
            reasons.append("Task type: Complex refactor / DB schema / AST migration")
        elif any(w in desc_lower for w in ["prd", "architecture", "grill-me", "system design", "socratic", "bootstrap"]):
            base_score += 7.0
            reasons.append("Task type: Strategic PRD / Socratic alignment / System Architecture")

        # 2. Avaliação pela Persona Ativa (BMAD)
        persona_upper = active_persona.upper()
        if persona_upper == "PM":
            base_score += 1.5
            reasons.append("Persona PM: High-level requirements and specifications")
        elif persona_upper == "ARCHITECT":
            base_score += 2.0
            reasons.append("Persona ARCHITECT: Deep architectural and ADR analysis")
        elif persona_upper == "DEVELOPER":
            base_score += 0.5
            reasons.append("Persona DEVELOPER: Implementation focus")
        elif persona_upper == "QA":
            base_score += 0.0
            reasons.append("Persona QA: Verification and test execution")

        # 3. Raio de Impacto no Grafo AST (Graphify)
        if ast_connected_nodes > 20:
            base_score += 2.5
            reasons.append(f"High AST Graph impact radius ({ast_connected_nodes} connected nodes)")
        elif ast_connected_nodes > 5:
            base_score += 1.0
            reasons.append(f"Moderate AST Graph impact radius ({ast_connected_nodes} connected nodes)")

        # 4. Volume de Código Afetado
        if surgical_lines_affected > 200 or payload_size_kb > 50:
            base_score += 2.0
            reasons.append(f"High volume impact ({surgical_lines_affected} lines, {payload_size_kb}KB)")
        elif surgical_lines_affected > 50 or payload_size_kb > 10:
            base_score += 1.0
            reasons.append(f"Moderate volume impact ({surgical_lines_affected} lines, {payload_size_kb}KB)")

        # Normaliza o score final na escala 1.0 a 10.0
        final_score = round(min(max(base_score, 1.0), 10.0), 1)

        # Matriz de Seleção de Modelos por Tier de Peso
        if final_score <= 2.5:
            primary_model = "gemini-3.1-flash-lite"
            fallback_model = "gemini-2.5-flash-lite"
            tier_label = "Ultra-Lightweight"
        elif final_score <= 5.5:
            primary_model = "gemini-3.1-flash"
            fallback_model = "gemini-2.5-flash"
            tier_label = "Moderate"
        elif final_score <= 8.5:
            primary_model = "gemini-3.1-pro"
            fallback_model = "gemini-3.1-flash"
            tier_label = "Heavy / Refactoring"
        else:
            primary_model = "gemini-3.1-pro"
            fallback_model = "gemini-3.1-pro"
            tier_label = "Supreme / Strategic"

        # Verificação de Disponibilidade no GCP State Matrix
        available, avail_msg = self.registry.is_model_available(primary_model)
        selected_model = primary_model
        model_degraded = False

        if not available:
            selected_model = fallback_model
            model_degraded = True
            reasons.append(f"Primary model '{primary_model}' unavailable ({avail_msg}). Falling back to '{fallback_model}'.")

        # Verificação de Cota Deslizante (RPM / RPD)
        usage = self.tracker.get_sliding_window_usage(selected_model)
        model_info = self.registry.get_model_info(selected_model) or {}

        rpd_limit = model_info.get("rpd_limit", 500)
        rpm_limit = model_info.get("rpm_limit", 15)

        if usage["rpd_24h"] >= (rpd_limit * 0.90) and selected_model != "gemini-3.1-flash-lite":
            selected_model = "gemini-3.1-flash-lite"
            model_degraded = True
            reasons.append(f"Model cota limit near exhaustion (RPD {usage['rpd_24h']}/{rpd_limit}). Auto-degrading to Flash Lite.")

        return {
            "task_description": task_description,
            "weight_score": final_score,
            "tier_label": tier_label,
            "selected_model": selected_model,
            "primary_model_proposed": primary_model,
            "model_degraded": model_degraded,
            "evaluation_reasons": reasons,
            "current_window_usage": usage
        }
