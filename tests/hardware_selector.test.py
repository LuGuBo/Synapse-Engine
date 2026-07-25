"""
Comprehensive TDD test suite for src/hardware_selector.py
Covers: HardwareSelector initialization, GPU detection (mocked), all routing branches,
        user overrides, edge cases, and the main() CLI entry point.
"""
import json
import sys
import os
import unittest
from io import StringIO
from unittest.mock import patch, MagicMock, PropertyMock

# Ensure src is importable regardless of working directory
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from hardware_selector import HardwareSelector, main  # noqa: E402


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _make_gpu_info(available: bool = True, name: str = "TestGPU", provider: str = "DirectML"):
    return {"gpu_available": available, "gpu_name": name, "provider": provider}


# ---------------------------------------------------------------------------
# 1. Initialization & basic properties
# ---------------------------------------------------------------------------
class TestHardwareSelectorInit(unittest.TestCase):
    def test_cpu_cores_is_positive(self):
        """cpu_cores must always be >= 1."""
        selector = HardwareSelector()
        self.assertGreaterEqual(selector.cpu_cores, 1)

    def test_gpu_info_is_none_before_first_access(self):
        """_gpu_info internal cache starts as None (lazy init)."""
        selector = HardwareSelector()
        self.assertIsNone(selector._gpu_info)

    def test_gpu_info_property_returns_dict_with_expected_keys(self):
        """gpu_info property must expose gpu_available, gpu_name, and provider."""
        selector = HardwareSelector()
        info = selector.gpu_info
        self.assertIn("gpu_available", info)
        self.assertIn("gpu_name", info)
        self.assertIn("provider", info)

    def test_gpu_info_is_cached_after_first_access(self):
        """Subsequent accesses must return the same cached object (no re-detection)."""
        selector = HardwareSelector()
        first = selector.gpu_info
        second = selector.gpu_info
        self.assertIs(first, second)

    def test_cpu_cores_fallback_when_os_returns_none(self):
        """When os.cpu_count() returns None, cpu_cores must default to 4."""
        with patch("hardware_selector.os.cpu_count", return_value=None):
            selector = HardwareSelector()
            self.assertEqual(selector.cpu_cores, 4)


# ---------------------------------------------------------------------------
# 2. GPU Detection — _detect_gpu_acceleration()
# ---------------------------------------------------------------------------
class TestGPUDetectionWindows(unittest.TestCase):
    """Windows-specific winreg path detection."""

    def _make_selector_with_detection(self):
        """Returns a fresh selector without triggering lazy gpu_info init."""
        selector = HardwareSelector()
        selector._gpu_info = None
        return selector

    @patch("hardware_selector.sys.platform", "win32")
    def test_winreg_detects_gpu_on_windows(self):
        """When winreg finds a GPU entry, provider must be DirectML."""
        import winreg as _wr_real  # noqa: F401 — imported to satisfy isinstance checks

        fake_sub_key = MagicMock()
        fake_sub_key.__enter__ = lambda s: s
        fake_sub_key.__exit__ = MagicMock(return_value=False)

        with patch("hardware_selector.sys.platform", "win32"), \
             patch.dict("sys.modules", {"torch": MagicMock(cuda=MagicMock(is_available=lambda: False))}):
            # Patch winreg at module level
            mock_winreg = MagicMock()
            mock_key = MagicMock()
            mock_sub_key = MagicMock()
            mock_winreg.OpenKey.side_effect = [mock_key, mock_sub_key]
            mock_winreg.EnumKey.side_effect = ["0000", OSError]
            mock_winreg.QueryValueEx.return_value = ("NVIDIA GeForce RTX 4090", 1)
            mock_sub_key.Close = MagicMock()
            mock_key.Close = MagicMock()

            with patch.dict("sys.modules", {"winreg": mock_winreg}):
                selector = HardwareSelector()
                selector._gpu_info = None
                result = selector._detect_gpu_acceleration()

            self.assertIsInstance(result, dict)
            self.assertIn("provider", result)

    @patch("hardware_selector.sys.platform", "linux")
    def test_no_winreg_on_non_windows(self):
        """On non-Windows, winreg detection must be skipped; fallback to CPU or CUDA."""
        mock_torch = MagicMock()
        mock_torch.cuda.is_available.return_value = False
        with patch.dict("sys.modules", {"torch": mock_torch, "winreg": None}):
            selector = HardwareSelector()
            selector._gpu_info = None
            result = selector._detect_gpu_acceleration()
        self.assertFalse(result["gpu_available"])
        self.assertEqual(result["provider"], "CPU")

    def test_torch_cuda_detected_sets_cuda_provider(self):
        """When torch.cuda.is_available() == True, provider must be CUDA."""
        mock_torch = MagicMock()
        mock_torch.cuda.is_available.return_value = True
        mock_torch.cuda.get_device_name.return_value = "Tesla V100"

        with patch("hardware_selector.sys.platform", "linux"), \
             patch.dict("sys.modules", {"torch": mock_torch}):
            selector = HardwareSelector()
            selector._gpu_info = None
            result = selector._detect_gpu_acceleration()

        self.assertTrue(result["gpu_available"])
        self.assertEqual(result["provider"], "CUDA")
        self.assertEqual(result["gpu_name"], "Tesla V100")

    def test_import_error_on_torch_falls_back_gracefully(self):
        """When torch is not installed (sys.modules returns None), provider must stay CPU."""
        # Setting a module to None in sys.modules causes ImportError on 'import torch'
        # This is the standard and deterministic way to simulate a missing package.
        with patch("hardware_selector.sys.platform", "linux"), \
             patch.dict("sys.modules", {"torch": None}):
            selector = HardwareSelector()
            selector._gpu_info = None
            result = selector._detect_gpu_acceleration()
        self.assertEqual(result["provider"], "CPU")
        self.assertFalse(result["gpu_available"])

    def test_winreg_os_error_handled_gracefully(self):
        """OSError from winreg.OpenKey must be caught; gpu_detected stays False."""
        mock_winreg = MagicMock()
        mock_winreg.OpenKey.side_effect = OSError("Access denied")
        mock_winreg.HKEY_LOCAL_MACHINE = 0x80000002

        mock_torch = MagicMock()
        mock_torch.cuda.is_available.return_value = False

        with patch("hardware_selector.sys.platform", "win32"), \
             patch.dict("sys.modules", {"winreg": mock_winreg, "torch": mock_torch}):
            selector = HardwareSelector()
            selector._gpu_info = None
            result = selector._detect_gpu_acceleration()

        self.assertFalse(result["gpu_available"])


# ---------------------------------------------------------------------------
# 3. select_execution_device — CPU short-circuit workloads
# ---------------------------------------------------------------------------
class TestCPUShortCircuitWorkloads(unittest.TestCase):
    """CPU-guaranteed workloads must bypass GPU detection entirely."""

    CPU_WORKLOADS = ["mcp_ipc", "ast_query", "json_state", "secret_scan", "git_diff"]

    def setUp(self):
        self.selector = HardwareSelector()

    def test_all_cpu_workloads_route_to_cpu(self):
        """Every workload in the IPC list must route to CPU regardless of payload."""
        for wl in self.CPU_WORKLOADS:
            with self.subTest(workload=wl):
                result = self.selector.select_execution_device(wl, payload_size_kb=99999.0)
                self.assertEqual(result["selected_device"], "CPU", f"Failed for workload: {wl}")
                self.assertEqual(result["provider"], "CPU")

    def test_cpu_workloads_never_access_gpu_info(self):
        """CPU short-circuit workloads must NOT touch gpu_info (no lazy init)."""
        with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
            mock_gpu.return_value = _make_gpu_info()
            selector = HardwareSelector()
            selector.select_execution_device("mcp_ipc")
            mock_gpu.assert_not_called()

    def test_cpu_workloads_case_insensitive(self):
        """Workload type matching must be case-insensitive."""
        result = self.selector.select_execution_device("MCP_IPC", payload_size_kb=0.0)
        self.assertEqual(result["selected_device"], "CPU")

    def test_cpu_workload_reason_contains_latency_hint(self):
        """The reason string must mention 'ultra-low latency' for IPC workloads."""
        result = self.selector.select_execution_device("ast_query")
        self.assertIn("ultra-low latency", result["reason"])


# ---------------------------------------------------------------------------
# 4. select_execution_device — user_override='cpu'
# ---------------------------------------------------------------------------
class TestUserOverrideCPU(unittest.TestCase):
    def setUp(self):
        self.selector = HardwareSelector()

    def test_cpu_override_on_gpu_workload(self):
        """Explicit 'cpu' override must route heavy workloads to CPU."""
        with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
            mock_gpu.return_value = _make_gpu_info(available=True)
            result = self.selector.select_execution_device("batch_embeddings", user_override="cpu")
        self.assertEqual(result["selected_device"], "CPU")
        self.assertIn("explicit override", result["reason"].lower())

    def test_cpu_override_case_insensitive(self):
        """Override must work with any casing: 'CPU', 'Cpu', 'cPu'."""
        for override in ["CPU", "Cpu", "cPu"]:
            with self.subTest(override=override):
                result = self.selector.select_execution_device("neural_inference", user_override=override)
                self.assertEqual(result["selected_device"], "CPU")

    def test_cpu_override_bypasses_gpu_detection(self):
        """When override='cpu', gpu_info must NOT be accessed."""
        with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
            mock_gpu.return_value = _make_gpu_info()
            self.selector.select_execution_device("matrix_compute", user_override="cpu")
            mock_gpu.assert_not_called()


# ---------------------------------------------------------------------------
# 5. select_execution_device — user_override='gpu'
# ---------------------------------------------------------------------------
class TestUserOverrideGPU(unittest.TestCase):
    def setUp(self):
        self.selector = HardwareSelector()

    def test_gpu_override_with_gpu_available(self):
        """'gpu' override + GPU present must select GPU."""
        with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
            mock_gpu.return_value = _make_gpu_info(available=True, name="RTX 4090", provider="DirectML")
            result = self.selector.select_execution_device("mcp_ipc", user_override="gpu")
        self.assertEqual(result["selected_device"], "GPU")
        self.assertIn("explicit override", result["reason"].lower())

    def test_gpu_override_without_gpu_falls_back_to_cpu(self):
        """'gpu' override + no GPU must fall back to CPU with a clear reason."""
        with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
            mock_gpu.return_value = _make_gpu_info(available=False, name="None", provider="CPU")
            result = self.selector.select_execution_device("json_state", user_override="gpu")
        self.assertEqual(result["selected_device"], "CPU")
        self.assertIn("Falling back to CPU", result["reason"])

    def test_gpu_override_on_cpu_workload_still_overrides_short_circuit(self):
        """When user explicitly requests GPU on a CPU-type workload, short-circuit is bypassed."""
        with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
            mock_gpu.return_value = _make_gpu_info(available=True)
            result = self.selector.select_execution_device("git_diff", user_override="gpu")
        self.assertEqual(result["selected_device"], "GPU")

    def test_gpu_override_case_insensitive(self):
        """Override 'GPU', 'Gpu', 'gPu' all must work."""
        for override in ["GPU", "Gpu", "gPu"]:
            with self.subTest(override=override):
                with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
                    mock_gpu.return_value = _make_gpu_info(available=True)
                    result = self.selector.select_execution_device("ast_query", user_override=override)
                self.assertEqual(result["selected_device"], "GPU")


# ---------------------------------------------------------------------------
# 6. select_execution_device — heavy GPU workloads
# ---------------------------------------------------------------------------
class TestHeavyGPUWorkloads(unittest.TestCase):
    HEAVY_WORKLOADS = ["batch_embeddings", "neural_inference", "matrix_compute"]

    def setUp(self):
        self.selector = HardwareSelector()

    def test_heavy_workloads_route_to_gpu_when_available(self):
        """batch_embeddings / neural_inference / matrix_compute must route to GPU if present."""
        for wl in self.HEAVY_WORKLOADS:
            with self.subTest(workload=wl):
                with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
                    mock_gpu.return_value = _make_gpu_info(available=True, name="A100", provider="CUDA")
                    result = self.selector.select_execution_device(wl)
                self.assertEqual(result["selected_device"], "GPU", f"Workload {wl} should use GPU")
                self.assertEqual(result["provider"], "CUDA")

    def test_heavy_workloads_fall_back_to_cpu_when_no_gpu(self):
        """Without GPU, heavy workloads must degrade gracefully to CPU."""
        for wl in self.HEAVY_WORKLOADS:
            with self.subTest(workload=wl):
                with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
                    mock_gpu.return_value = _make_gpu_info(available=False, name="None", provider="CPU")
                    result = self.selector.select_execution_device(wl)
                self.assertEqual(result["selected_device"], "CPU")
                self.assertIn("prefers GPU", result["reason"])

    def test_heavy_workload_reason_mentions_parallel_compute(self):
        """Reason for GPU routing must reference parallel compute."""
        with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
            mock_gpu.return_value = _make_gpu_info(available=True, provider="DirectML")
            result = self.selector.select_execution_device("batch_embeddings")
        self.assertIn("parallel GPU compute", result["reason"])


# ---------------------------------------------------------------------------
# 7. select_execution_device — payload size threshold (1024 KB)
# ---------------------------------------------------------------------------
class TestPayloadSizeRouting(unittest.TestCase):
    def setUp(self):
        self.selector = HardwareSelector()

    def test_payload_above_threshold_routes_to_gpu(self):
        """Payload >= 1024 KB with GPU present must route to GPU."""
        with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
            mock_gpu.return_value = _make_gpu_info(available=True)
            result = self.selector.select_execution_device("general", payload_size_kb=1024.0)
        self.assertEqual(result["selected_device"], "GPU")
        self.assertIn("1MB threshold", result["reason"])

    def test_payload_exactly_at_threshold_routes_to_gpu(self):
        """Exactly 1024.0 KB is the boundary; must route to GPU."""
        with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
            mock_gpu.return_value = _make_gpu_info(available=True)
            result = self.selector.select_execution_device("any_workload", payload_size_kb=1024.0)
        self.assertEqual(result["selected_device"], "GPU")

    def test_payload_below_threshold_routes_to_cpu(self):
        """Payload < 1024 KB must stay on CPU even with GPU present."""
        with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
            mock_gpu.return_value = _make_gpu_info(available=True)
            result = self.selector.select_execution_device("general", payload_size_kb=1023.99)
        self.assertEqual(result["selected_device"], "CPU")
        self.assertIn("below 1MB threshold", result["reason"])

    def test_payload_above_threshold_but_no_gpu_falls_to_cpu(self):
        """Even with large payload, absence of GPU must route to CPU."""
        with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
            mock_gpu.return_value = _make_gpu_info(available=False, name="None", provider="CPU")
            result = self.selector.select_execution_device("general", payload_size_kb=2048.0)
        self.assertEqual(result["selected_device"], "CPU")

    def test_zero_payload_no_gpu_routes_to_cpu(self):
        """Zero-byte payload with no GPU is the simplest CPU case."""
        with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
            mock_gpu.return_value = _make_gpu_info(available=False, name="None", provider="CPU")
            result = self.selector.select_execution_device("unknown", payload_size_kb=0.0)
        self.assertEqual(result["selected_device"], "CPU")

    def test_reason_mentions_no_gpu_when_unavailable(self):
        """Reason must state 'No GPU available' when no GPU is detected."""
        with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
            mock_gpu.return_value = _make_gpu_info(available=False, name="None", provider="CPU")
            result = self.selector.select_execution_device("general", payload_size_kb=500.0)
        self.assertIn("No GPU available", result["reason"])


# ---------------------------------------------------------------------------
# 8. Response schema validation
# ---------------------------------------------------------------------------
class TestResponseSchema(unittest.TestCase):
    REQUIRED_KEYS = {"selected_device", "reason", "gpu_available", "gpu_name", "provider"}

    def setUp(self):
        self.selector = HardwareSelector()

    def _run_and_validate(self, workload, payload=0.0, override=None):
        with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
            mock_gpu.return_value = _make_gpu_info()
            result = self.selector.select_execution_device(workload, payload, override)
        self.assertIsInstance(result, dict)
        for key in self.REQUIRED_KEYS:
            self.assertIn(key, result, f"Key '{key}' missing for workload '{workload}'")

    def test_schema_for_cpu_short_circuit(self):
        self._run_and_validate("mcp_ipc")

    def test_schema_for_gpu_override(self):
        self._run_and_validate("mcp_ipc", override="gpu")

    def test_schema_for_cpu_override(self):
        self._run_and_validate("batch_embeddings", override="cpu")

    def test_schema_for_heavy_workload_gpu(self):
        self._run_and_validate("neural_inference")

    def test_schema_for_payload_threshold(self):
        self._run_and_validate("general", payload=2048.0)

    def test_selected_device_is_cpu_or_gpu(self):
        """selected_device must always be exactly 'CPU' or 'GPU'."""
        for wl in ["mcp_ipc", "batch_embeddings", "general"]:
            with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as m:
                m.return_value = _make_gpu_info()
                result = self.selector.select_execution_device(wl)
            self.assertIn(result["selected_device"], {"CPU", "GPU"})


# ---------------------------------------------------------------------------
# 9. main() CLI entry point
# ---------------------------------------------------------------------------
class TestMainEntrypoint(unittest.TestCase):
    """Tests for the CLI main() function."""

    def _run_main_with_args(self, args):
        with patch("sys.argv", args), \
             patch("sys.stdout", new_callable=StringIO) as mock_out, \
             patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
            mock_gpu.return_value = _make_gpu_info(available=True, name="RTX 4090", provider="DirectML")
            main()
            return mock_out.getvalue()

    def test_no_args_prints_human_readable_output(self):
        """With no --json flag, main() prints human-readable GPU/CPU info."""
        output = self._run_main_with_args(["hardware_selector.py"])
        self.assertIn("CPU Cores:", output)
        self.assertIn("GPU Available:", output)
        self.assertIn("GPU Name:", output)
        self.assertIn("Provider:", output)

    def test_json_flag_outputs_valid_json(self):
        """With --json flag, main() must output parseable JSON."""
        output = self._run_main_with_args(["hardware_selector.py", "--json", "batch_embeddings", "512"])
        parsed = json.loads(output)
        self.assertIn("selected_device", parsed)

    def test_json_flag_with_cpu_override(self):
        """--json with explicit cpu override must return CPU device in JSON output."""
        output = self._run_main_with_args(
            ["hardware_selector.py", "--json", "batch_embeddings", "512", "cpu"]
        )
        parsed = json.loads(output)
        self.assertEqual(parsed["selected_device"], "CPU")

    def test_json_flag_with_no_workload_defaults_to_auto(self):
        """--json with only the flag (no workload arg) defaults to 'auto' workload."""
        output = self._run_main_with_args(["hardware_selector.py", "--json"])
        parsed = json.loads(output)
        self.assertIn("selected_device", parsed)

    def test_json_flag_with_payload_above_threshold_routes_gpu(self):
        """--json + payload 2048 KB must route to GPU when GPU available."""
        output = self._run_main_with_args(
            ["hardware_selector.py", "--json", "general", "2048.0"]
        )
        parsed = json.loads(output)
        self.assertEqual(parsed["selected_device"], "GPU")


# ---------------------------------------------------------------------------
# 10. Edge cases & boundary conditions
# ---------------------------------------------------------------------------
class TestEdgeCases(unittest.TestCase):
    def setUp(self):
        self.selector = HardwareSelector()

    def test_empty_string_workload(self):
        """Empty string workload type must not raise; falls through to payload routing."""
        with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
            mock_gpu.return_value = _make_gpu_info(available=False)
            result = self.selector.select_execution_device("", payload_size_kb=0.0)
        self.assertIn("selected_device", result)

    def test_unknown_workload_routes_by_payload(self):
        """An unrecognized workload with small payload must default to CPU."""
        with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
            mock_gpu.return_value = _make_gpu_info(available=True)
            result = self.selector.select_execution_device("unknown_workload_xyz", payload_size_kb=100.0)
        self.assertEqual(result["selected_device"], "CPU")

    def test_none_override_is_treated_as_no_override(self):
        """Passing None as user_override must not affect routing logic."""
        with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
            mock_gpu.return_value = _make_gpu_info(available=True)
            result = self.selector.select_execution_device("batch_embeddings", user_override=None)
        self.assertEqual(result["selected_device"], "GPU")

    def test_float_payload_precision(self):
        """Payload of 1023.9999 KB is strictly below threshold and must route to CPU."""
        with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
            mock_gpu.return_value = _make_gpu_info(available=True)
            result = self.selector.select_execution_device("general", payload_size_kb=1023.9999)
        self.assertEqual(result["selected_device"], "CPU")

    def test_very_large_payload(self):
        """Extremely large payload (e.g., 10 GB) must route to GPU without overflow."""
        with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
            mock_gpu.return_value = _make_gpu_info(available=True)
            result = self.selector.select_execution_device("general", payload_size_kb=10_485_760.0)
        self.assertEqual(result["selected_device"], "GPU")

    def test_gpu_provider_propagated_in_result(self):
        """Provider from gpu_info must be correctly propagated to the response dict."""
        with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
            mock_gpu.return_value = _make_gpu_info(available=True, provider="CUDA")
            result = self.selector.select_execution_device("batch_embeddings")
        self.assertEqual(result["provider"], "CUDA")

    def test_gpu_name_propagated_in_result(self):
        """GPU name from gpu_info must appear verbatim in the result."""
        with patch.object(HardwareSelector, "gpu_info", new_callable=PropertyMock) as mock_gpu:
            mock_gpu.return_value = _make_gpu_info(available=True, name="RTX 3080 Ti")
            result = self.selector.select_execution_device("neural_inference")
        self.assertEqual(result["gpu_name"], "RTX 3080 Ti")


if __name__ == "__main__":
    unittest.main(verbosity=2)
