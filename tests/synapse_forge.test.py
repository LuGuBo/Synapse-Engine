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

    def test_parse_frontmatter_complex(self):
        engine = SynapseEngineHybridEngine()
        yaml_sample = """---
name: test-skill
url: https://github.com/test/repo:v1 # repo url
always_on: true
scope: global
---
# Body content
"""
        metadata = engine._parse_frontmatter(yaml_sample)
        self.assertEqual(metadata.get("name"), "test-skill")
        self.assertEqual(metadata.get("url"), "https://github.com/test/repo:v1")
        self.assertEqual(metadata.get("always_on"), True)
        self.assertEqual(metadata.get("scope"), "global")

if __name__ == '__main__':
    unittest.main()


