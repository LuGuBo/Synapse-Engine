import unittest
import os
import sys

# Ensure src directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))

from synapse_forge import SynapseEngineHybridEngine

class TestSynapseForge(unittest.TestCase):
    def test_hybrid_engine_init(self):
        engine = SynapseEngineHybridEngine()
        self.assertEqual(engine.local_dir.name, "skills")

