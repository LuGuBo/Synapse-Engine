import os
import sys
import json
import subprocess
from typing import Dict, Any, Optional

class HardwareSelector:
    """
    Dynamic Hardware Selector for Synapse Engine.
    Routes execution to CPU, GPU, or NPU based on workload classification, payload size,
    and available hardware acceleration providers (DirectML, CUDA, OpenVINO, VitisAI, etc.).
    """
    _torch_checked: bool = False
    _torch_cuda_available: bool = False
    _torch_device_name: str = "None"

    def __init__(self) -> None:
        self.cpu_cores: int = os.cpu_count() or 4
        self._gpu_info: Optional[Dict[str, Any]] = None

    @classmethod
    def _check_torch_cuda(cls) -> None:
        """
        Memoized PyTorch CUDA detection to avoid repeated ImportError checks (O(1) after init).
        """
        if cls._torch_checked:
            return
        cls._torch_checked = True
        try:
            import torch
            if torch.cuda.is_available():
                cls._torch_cuda_available = True
                cls._torch_device_name = torch.cuda.get_device_name(0)
        except ImportError:
            cls._torch_cuda_available = False

    @property
    def gpu_info(self) -> Dict[str, Any]:
        if self._gpu_info is None:
            self._gpu_info = self._detect_hardware_acceleration()
        return self._gpu_info

    def _detect_hardware_acceleration(self) -> Dict[str, Any]:
        gpu_detected = False
        gpu_name = "None"
        provider = "CPU"
        npu_detected = False
        npu_name = "None"

        if sys.platform == "win32":
            try:
                import winreg
                path = r"SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}"
                key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, path)
                gpus = []
                npus = []
                for i in range(100):
                    try:
                        sub_key_name = winreg.EnumKey(key, i)
                        if sub_key_name.isdigit():
                            sub_key = winreg.OpenKey(key, sub_key_name)
                            try:
                                driver_desc, _ = winreg.QueryValueEx(sub_key, "DriverDesc")
                                if driver_desc:
                                    desc_lower = driver_desc.lower()
                                    if "npu" in desc_lower or "vitis" in desc_lower or "ai boost" in desc_lower or "ryzen ai" in desc_lower:
                                        npus.append(driver_desc)
                                    else:
                                        gpus.append(driver_desc)
                            except OSError:
                                pass
                            finally:
                                sub_key.Close()
                    except OSError:
                        break
                key.Close()
                if gpus:
                    gpu_detected = True
                    gpu_name = ", ".join(gpus)
                    provider = "DirectML"
                if npus:
                    npu_detected = True
                    npu_name = ", ".join(npus)
            except OSError:
                gpu_detected = False

        self._check_torch_cuda()
        if self._torch_cuda_available:
            gpu_detected = True
            provider = "CUDA"
            gpu_name = self._torch_device_name

        accelerator_type = "CPU"
        if gpu_detected and npu_detected:
            accelerator_type = "HYBRID"
        elif gpu_detected:
            accelerator_type = "GPU"
        elif npu_detected:
            accelerator_type = "NPU"

        return {
            "gpu_available": gpu_detected,
            "gpu_name": gpu_name,
            "provider": provider,
            "npu_available": npu_detected,
            "npu_name": npu_name,
            "accelerator_type": accelerator_type
        }

    def patch_onnxruntime_topology(self, target_device: str = "gpu") -> Dict[str, Any]:
        """
        Doc-Boy Pattern: Dynamically configures ONNX Runtime execution providers (DirectML FP16/FP32 for GPU, VitisAI/DirectML INT8 for NPU).
        """
        gpu_info = self.gpu_info
        dev = target_device.lower()
        if dev in ["gpu", "directml"] and gpu_info["gpu_available"]:
            return {
                "provider": "DmlExecutionProvider",
                "device": "GPU",
                "fp_precision": "FP16",
                "patched": True
            }
        elif dev in ["npu", "vitisai"] and gpu_info["npu_available"]:
            return {
                "provider": "VitisAIExecutionProvider",
                "device": "NPU",
                "quantization": "INT8",
                "patched": True
            }
        return {
            "provider": "CPUExecutionProvider",
            "device": "CPU",
            "patched": False
        }

    def select_execution_device(
        self,
        workload_type: str,
        payload_size_kb: float = 0.0,
        user_override: Optional[str] = None
    ) -> Dict[str, Any]:
        w_type = workload_type.lower()

        # Ultra-fast short-circuit optimization for CPU-bound tasks & Fast-Path SIMD text/code files
        fast_path_exts = [".py", ".ts", ".md", ".json", ".js", ".html", ".css"]
        is_fast_path_file = any(w_type.endswith(ext) for ext in fast_path_exts)
        is_cpu_workload = is_fast_path_file or w_type in [
            "mcp_ipc", "ast_query", "json_state", "secret_scan", "git_diff",
            "fast_path_text", "fast_path_code", "fast_path"
        ]
        is_cpu_override = user_override is not None and user_override.lower() == "cpu"

        if is_cpu_override or (is_cpu_workload and not (user_override and user_override.lower() == "gpu")):
            return {
                "selected_device": "CPU",
                "reason": "User explicit override ('cpu')" if is_cpu_override else f"Workload type '{workload_type}' requires ultra-low latency IPC (<0.5ms). CPU preferred.",
                "gpu_available": False,
                "gpu_name": "None",
                "provider": "CPU",
                "npu_available": False,
                "accelerator_type": "CPU"
            }

        # Explicit user override for GPU
        if user_override and user_override.lower() == "gpu":
            gpu_info = self.gpu_info
            device = "GPU" if gpu_info["gpu_available"] else "CPU"
            reason = "User explicit override ('gpu')" if gpu_info["gpu_available"] else "Requested GPU override, but no acceleration device detected. Falling back to CPU."
            return {
                "selected_device": device,
                "reason": reason,
                "gpu_available": gpu_info["gpu_available"],
                "gpu_name": gpu_info["gpu_name"],
                "provider": gpu_info["provider"],
                "npu_available": gpu_info["npu_available"],
                "accelerator_type": gpu_info["accelerator_type"]
            }

        gpu_info = self.gpu_info

        if w_type in ["batch_embeddings", "neural_inference", "matrix_compute"]:
            if gpu_info["gpu_available"]:
                return {
                    "selected_device": "GPU",
                    "reason": f"Heavy workload '{workload_type}' benefits from parallel GPU compute ({gpu_info['provider']}).",
                    "gpu_available": True,
                    "gpu_name": gpu_info["gpu_name"],
                    "provider": gpu_info["provider"],
                    "npu_available": gpu_info["npu_available"],
                    "accelerator_type": gpu_info["accelerator_type"]
                }
            elif gpu_info["npu_available"]:
                return {
                    "selected_device": "NPU",
                    "reason": f"Workload '{workload_type}' routed to NPU for energy-efficient neural inference.",
                    "gpu_available": False,
                    "gpu_name": "None",
                    "provider": "VitisAI/DirectML",
                    "npu_available": True,
                    "accelerator_type": gpu_info["accelerator_type"]
                }
            else:
                return {
                    "selected_device": "CPU",
                    "reason": f"Workload '{workload_type}' prefers acceleration, but no GPU or NPU was detected. Falling back to CPU.",
                    "gpu_available": False,
                    "gpu_name": "None",
                    "provider": "CPU",
                    "npu_available": False,
                    "accelerator_type": "CPU"
                }

        if payload_size_kb >= 1024.0 and gpu_info["gpu_available"]:
            return {
                "selected_device": "GPU",
                "reason": f"Payload size ({payload_size_kb:.2f} KB) exceeds 1MB threshold. Routing to GPU for throughput.",
                "gpu_available": True,
                "gpu_name": gpu_info["gpu_name"],
                "provider": gpu_info["provider"],
                "npu_available": gpu_info["npu_available"],
                "accelerator_type": gpu_info["accelerator_type"]
            }
        else:
            reason = f"Payload size ({payload_size_kb:.2f} KB) below 1MB threshold." if gpu_info["gpu_available"] else "No GPU available."
            return {
                "selected_device": "CPU",
                "reason": f"{reason} Routing to CPU for zero setup overhead.",
                "gpu_available": gpu_info["gpu_available"],
                "gpu_name": gpu_info["gpu_name"],
                "provider": gpu_info["provider"],
                "npu_available": gpu_info["npu_available"],
                "accelerator_type": gpu_info["accelerator_type"]
            }

def main() -> None:
    selector = HardwareSelector()
    if len(sys.argv) > 1 and sys.argv[1] == "--json":
        workload = sys.argv[2] if len(sys.argv) > 2 else "auto"
        size = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
        override = sys.argv[4] if len(sys.argv) > 4 else None
        res = selector.select_execution_device(workload, size, override)
        print(json.dumps(res, indent=2))
    else:
        info = selector.gpu_info
        print(f"CPU Cores: {selector.cpu_cores}")
        print(f"GPU Available: {info['gpu_available']}")
        print(f"GPU Name: {info['gpu_name']}")
        print(f"Provider: {info['provider']}")
        print(f"NPU Available: {info['npu_available']}")
        print(f"Accelerator Type: {info['accelerator_type']}")

if __name__ == "__main__":
    main()

