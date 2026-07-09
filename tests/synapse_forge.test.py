from synapse_forge import SynapseEngineHybridEngine

def test_hybrid_engine_init():
    engine = SynapseEngineHybridEngine()
    assert engine.local_dir.name == "skills"

