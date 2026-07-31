import os
import json
from datetime import datetime
from enum import Enum

class WorkloadTier(Enum):
    TIER_0_EMBEDDING = 0
    TIER_1_LIGHT = 1
    TIER_2_MEDIUM = 2
    TIER_3_HEAVY = 3

class ModelRouter:
    """
    Roteador Dinâmico de Modelos (Workload-Aware).
    Protege as cotas do Nível Gratuito da API Gemini selecionando o modelo
    com melhor custo-benefício baseado na complexidade da tarefa.
    """
    
    # Limite diário seguro para o Gemini 3.6 Flash (Cota total é 20 RPD)
    MAX_HEAVY_RPD_LIMIT = 18 
    
    def __init__(self, workspace_root="."):
        self.playground_dir = os.path.join(workspace_root, ".playground")
        self.quota_file = os.path.join(self.playground_dir, "quota_tracker.json")
        self._ensure_quota_file()

    def _ensure_quota_file(self):
        if not os.path.exists(self.playground_dir):
            os.makedirs(self.playground_dir, exist_ok=True)
            
        if not os.path.exists(self.quota_file):
            self._reset_quota()

    def _reset_quota(self):
        today = datetime.now().strftime("%Y-%m-%d")
        data = {
            "date": today,
            "tier_2_count": 0
        }
        with open(self.quota_file, 'w', encoding='utf-8') as f:
            json.dump(data, f)
        return data

    def _get_quota_data(self):
        try:
            with open(self.quota_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            today = datetime.now().strftime("%Y-%m-%d")
            # Reseta se mudou o dia
            if data.get("date") != today:
                return self._reset_quota()
            return data
        except (json.JSONDecodeError, FileNotFoundError):
            return self._reset_quota()

    def _increment_heavy_quota(self):
        data = self._get_quota_data()
        data["tier_2_count"] = data.get("tier_2_count", 0) + 1
        with open(self.quota_file, 'w', encoding='utf-8') as f:
            json.dump(data, f)
        return data["tier_2_count"]

    def analyze_workload(self, prompt: str = "", intent: str = "generic") -> WorkloadTier:
        """
        Classifica a complexidade da carga de trabalho para roteamento otimizado.
        """
        intent = intent.lower()
        
        # 1. Embeddings e Vetores
        if intent in ["embedding", "vectorize", "semantic_search"]:
            return WorkloadTier.TIER_0_EMBEDDING
            
        # 2. Heurística Pesada (TDD, Refatoração, Arquitetura)
        heavy_keywords = ["refactor", "tdd", "debug", "architect", "complex_logic"]
        if any(kw in intent for kw in heavy_keywords):
            return WorkloadTier.TIER_2_MEDIUM # O Tier 3 (Heavy SDK) é gerido fora daqui
            
        # 3. Tamanho do Prompt
        # Assumindo ~4 chars por token, > 2000 tokens (8000 chars) é médio/pesado
        if len(prompt) > 8000:
            return WorkloadTier.TIER_2_MEDIUM
            
        # Padrão: Operação Leve (Extração, JSON, Resumos curtos)
        return WorkloadTier.TIER_1_LIGHT

    def get_model_for_task(self, prompt: str = "", intent: str = "generic") -> str:
        """
        Retorna o nome do modelo ideal, executando downgrade gracioso se 
        a cota do modelo pesado estiver prestes a estourar.
        """
        tier = self.analyze_workload(prompt, intent)
        
        if tier == WorkloadTier.TIER_0_EMBEDDING:
            return "gemini-embedding-2"
            
        if tier == WorkloadTier.TIER_1_LIGHT:
            return "gemini-3.5-flash-lite"
            
        if tier == WorkloadTier.TIER_2_MEDIUM:
            # Verifica cota antes de alocar
            data = self._get_quota_data()
            current_count = data.get("tier_2_count", 0)
            
            if current_count >= self.MAX_HEAVY_RPD_LIMIT:
                print(f"[ModelRouter] ALERTA: Cota do Gemini Flash (20 RPD) quase esgotada ({current_count}/{self.MAX_HEAVY_RPD_LIMIT}). Fallback para Flash Lite.")
                return "gemini-3.5-flash-lite"
                
            # Cota disponível. Incrementa e aloca.
            self._increment_heavy_quota()
            return "gemini-3.6-flash"
            
        # Default de segurança absoluta
        return "gemini-3.5-flash-lite"
