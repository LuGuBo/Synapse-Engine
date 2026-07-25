import os
import sys
import json
import subprocess

class HardwareSelector:
    """
    Dynamic Hardware Selector for Synapse Engine.
    Routes execution to CPU or GPU based on workload classification, payload size,
    and available hardware acceleration providers (DirectML, CUDA, etc.).
    """
    def __init__(self):
        self.cpu_cores = os.cpu_count() or 4
        self._gpu_info = None

    @property
    def gpu_info(self):
        if self._gpu_info is None:
            self._gpu_info = self._detect_gpu_acceleration()
        return self._gpu_info

    def _detect_gpu_acceleration(self):
        gpu_detected = False
        gpu_name = "None"
        provider = "CPU"

        if sys.platform == "win32":
            try:
                import winreg
                path = r"SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}"
                key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, path)
                gpus = []
                for i in range(100):
                    try:
                        sub_key_name = winreg.EnumKey(key, i)
                        if sub_key_name.isdigit():
                            sub_key = winreg.OpenKey(key, sub_key_name)
                            try:
                                driver_desc, _ = winreg.QueryValueEx(sub_key, "DriverDesc")
                                if driver_desc:
                                    gpus.append(driver_desc)
                            except OSError:
                                driver_desc = None
                            finally:
                                sub_key.Close()
                    except OSError:
                        break
                key.Close()
                if gpus:
                    gpu_detected = True
                    gpu_name = ", ".join(gpus)
                    provider = "DirectML"
            except OSError:
                gpu_detected = False

        try:
            import torch
            if torch.cuda.is_available():
                gpu_detected = True
                provider = "CUDA"
                gpu_name = torch.cuda.get_device_name(0)
        except ImportError:
            driver_desc = None

        return {
            "gpu_available": gpu_detected,
            "gpu_name": gpu_name,
            "provider": provider
        }

    def select_execution_device(self, workload_type, payload_size_kb=0.0, user_override=None):
        w_type = workload_type.lower()

        # Otimização extrema de curto-circuito para responder CPU instantaneamente
        # sem acessar a propriedade gpu_info (evitando inicialização/detecção de GPU)
        is_cpu_workload = w_type in ["mcp_ipc", "ast_query", "json_state", "secret_scan", "git_diff"]
        is_cpu_override = user_override and user_override.lower() == "cpu"

        if is_cpu_override or (is_cpu_workload and not (user_override and user_override.lower() == "gpu")):
            return {
                "selected_device": "CPU",
                "reason": "User explicit override ('cpu')" if is_cpu_override else f"Workload type '{workload_type}' requires ultra-low latency IPC (<0.5ms). CPU preferred.",
                "gpu_available": False,
                "gpu_name": "None",
                "provider": "CPU"
            }

        # Override manual para GPU
        if user_override and user_override.lower() == "gpu":
            gpu_info = self.gpu_info
            device = "GPU" if gpu_info["gpu_available"] else "CPU"
            reason = "User explicit override ('gpu')" if gpu_info["gpu_available"] else "Requested GPU override, but no acceleration device detected. Falling back to CPU."
            return {
                "selected_device": device,
                "reason": reason,
                "gpu_available": gpu_info["gpu_available"],
                "gpu_name": gpu_info["gpu_name"],
                "provider": gpu_info["provider"]
            }

        gpu_info = self.gpu_info

        if w_type in ["batch_embeddings", "neural_inference", "matrix_compute"]:
            if gpu_info["gpu_available"]:
                return {
                    "selected_device": "GPU",
                    "reason": f"Heavy workload '{workload_type}' benefits from parallel GPU compute ({gpu_info['provider']}).",
                    "gpu_available": True,
                    "gpu_name": gpu_info["gpu_name"],
                    "provider": gpu_info["provider"]
                }
            else:
                return {
                    "selected_device": "CPU",
                    "reason": f"Workload '{workload_type}' prefers GPU, but no GPU was detected. Falling back to CPU.",
                    "gpu_available": False,
                    "gpu_name": "None",
                    "provider": "CPU"
                }

        if payload_size_kb >= 1024.0 and gpu_info["gpu_available"]:
            return {
                "selected_device": "GPU",
                "reason": f"Payload size ({payload_size_kb:.2f} KB) exceeds 1MB threshold. Routing to GPU for throughput.",
                "gpu_available": True,
                "gpu_name": gpu_info["gpu_name"],
                "provider": gpu_info["provider"]
            }
        else:
            reason = f"Payload size ({payload_size_kb:.2f} KB) below 1MB threshold." if gpu_info["gpu_available"] else "No GPU available."
            return {
                "selected_device": "CPU",
                "reason": f"{reason} Routing to CPU for zero setup overhead.",
                "gpu_available": gpu_info["gpu_available"],
                "gpu_name": gpu_info["gpu_name"],
                "provider": gpu_info["provider"]
            }

def main():
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

if __name__ == "__main__":
    main()
