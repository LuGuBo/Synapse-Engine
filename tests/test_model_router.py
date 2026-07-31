import os
import json
import pytest
from datetime import datetime
from src.services.model_router import ModelRouter, WorkloadTier

@pytest.fixture
def router(tmp_path):
    # Usar tmp_path garante que o teste não polua o playground real
    return ModelRouter(workspace_root=str(tmp_path))

def test_analyze_workload_embedding(router):
    tier = router.analyze_workload(intent="semantic_search")
    assert tier == WorkloadTier.TIER_0_EMBEDDING

def test_analyze_workload_heavy_intent(router):
    tier = router.analyze_workload(intent="please refactor this module")
    assert tier == WorkloadTier.TIER_2_MEDIUM

def test_analyze_workload_large_prompt(router):
    large_prompt = "A" * 8001
    tier = router.analyze_workload(prompt=large_prompt, intent="generic")
    assert tier == WorkloadTier.TIER_2_MEDIUM

def test_analyze_workload_light(router):
    tier = router.analyze_workload(prompt="Short summarize", intent="summarize")
    assert tier == WorkloadTier.TIER_1_LIGHT

def test_get_model_for_task_light(router):
    model = router.get_model_for_task(intent="summarize")
    assert model == "gemini-3.5-flash-lite"

def test_get_model_for_task_fallback(router):
    # Simula esgotamento da cota (já está em 18)
    with open(router.quota_file, 'w', encoding='utf-8') as f:
        json.dump({"date": datetime.now().strftime("%Y-%m-%d"), "tier_2_count": 18}, f)
        
    model = router.get_model_for_task(intent="refactor")
    # Deve dar downgrade para o Lite pois bateu no limite MAX_HEAVY_RPD_LIMIT
    assert model == "gemini-3.5-flash-lite" 

def test_get_model_for_task_heavy_available(router):
    # Garante cota limpa
    with open(router.quota_file, 'w', encoding='utf-8') as f:
        json.dump({"date": datetime.now().strftime("%Y-%m-%d"), "tier_2_count": 5}, f)
        
    model = router.get_model_for_task(intent="refactor")
    # Cota disponível, deve usar o modelo pesado
    assert model == "gemini-3.6-flash" 
    
    # Checa se a cota incrementou para 6
    with open(router.quota_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    assert data["tier_2_count"] == 6

def test_reset_quota_on_new_day(router):
    # Escreve uma data antiga estourando o limite
    with open(router.quota_file, 'w', encoding='utf-8') as f:
        json.dump({"date": "2020-01-01", "tier_2_count": 20}, f)
        
    model = router.get_model_for_task(intent="refactor")
    # Deve detectar a virada de dia, resetar o contador e permitir o Heavy
    assert model == "gemini-3.6-flash"
    
    with open(router.quota_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    assert data["date"] == datetime.now().strftime("%Y-%m-%d")
    assert data["tier_2_count"] == 1
