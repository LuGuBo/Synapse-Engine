import unittest
import os
import sys

# Ensure src directory is in path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))

from hardware_selector import HardwareSelector

class TestHardwareSelector(unittest.TestCase):
    def setUp(self):
        self.selector = HardwareSelector()

    def test_initialization(self):
        self.assertGreater(self.selector.cpu_cores, 0)
        self.assertIn('gpu_available', self.selector.gpu_info)
        self.assertIn('gpu_name', self.selector.gpu_info)
        self.assertIn('provider', self.selector.gpu_info)
        self.assertIn('npu_available', self.selector.gpu_info)
        self.assertIn('accelerator_type', self.selector.gpu_info)

    def test_torch_memoization(self):
        # Verify class level torch check flag
        HardwareSelector._check_torch_cuda()
        self.assertTrue(HardwareSelector._torch_checked)

    def test_mcp_ipc_workload_routes_to_cpu(self):
        res = self.selector.select_execution_device('mcp_ipc', payload_size_kb=2048.0)
        self.assertEqual(res['selected_device'], 'CPU')
        self.assertIn('ultra-low latency', res['reason'])
        self.assertIn('accelerator_type', res)

    def test_user_override_cpu(self):
        res = self.selector.select_execution_device('matrix_compute', user_override='cpu')
        self.assertEqual(res['selected_device'], 'CPU')

    def test_payload_size_routing(self):
        res_small = self.selector.select_execution_device('general', payload_size_kb=500.0)
        self.assertEqual(res_small['selected_device'], 'CPU')

    def test_neural_inference_routing_fields(self):
        res = self.selector.select_execution_device('neural_inference')
        self.assertIn(res['selected_device'], ['CPU', 'GPU', 'NPU'])
        self.assertIn('accelerator_type', res)

if __name__ == '__main__':
    unittest.main()

