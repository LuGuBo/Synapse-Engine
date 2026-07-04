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
        self.gpu_info = self._detect_gpu_acceleration()

    def _detect_gpu_acceleration(self):
        gpu_detected = False
        gpu_name = "None"
        provider = "CPU"

        if sys.platform == "win32":
            try:
                cmd = 'powershell -NoProfile -Command "Get-CimInstance -ClassName Win32_VideoController | Select-Object -ExpandProperty Name"'
                res = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=3)
                if res.returncode == 0 and res.stdout.strip():
                    gpus = [g.strip() for g in res.stdout.strip().split('\n') if g.strip()]
                    if gpus:
                        gpu_detected = True
                        gpu_name = ", ".join(gpus)
                        provider = "DirectML"
            except Exception:
                gpu_detected = False

        try:
            import torch
            if torch.cuda.is_available():
                gpu_detected = True
                provider = "CUDA"
                gpu_name = torch.cuda.get_device_name(0)
        except ImportError:
            pass

        return {
            "gpu_available": gpu_detected,
            "gpu_name": gpu_name,
            "provider": provider
        }

    def select_execution_device(self, workload_type, payload_size_kb=0.0, user_override=None):
        if user_override and user_override.lower() in ["cpu", "gpu"]:
            device = user_override.upper()
            reason = f"User explicit override ('{user_override}')"
            if device == "GPU" and not self.gpu_info["gpu_available"]:
                device = "CPU"
                reason = "Requested GPU override, but no acceleration device detected. Falling back to CPU."
            return {
                "selected_device": device,
                "reason": reason,
                "gpu_available": self.gpu_info["gpu_available"],
                "gpu_name": self.gpu_info["gpu_name"],
                "provider": self.gpu_info["provider"]
            }

        w_type = workload_type.lower()

        if w_type in ["mcp_ipc", "ast_query", "json_state", "secret_scan", "git_diff"]:
            return {
                "selected_device": "CPU",
                "reason": f"Workload type '{workload_type}' requires ultra-low latency IPC (<0.5ms). CPU preferred.",
                "gpu_available": self.gpu_info["gpu_available"],
                "gpu_name": self.gpu_info["gpu_name"],
                "provider": self.gpu_info["provider"]
            }

        if w_type in ["batch_embeddings", "neural_inference", "matrix_compute"]:
            if self.gpu_info["gpu_available"]:
                return {
                    "selected_device": "GPU",
                    "reason": f"Heavy workload '{workload_type}' benefits from parallel GPU compute ({self.gpu_info['provider']}).",
                    "gpu_available": True,
                    "gpu_name": self.gpu_info["gpu_name"],
                    "provider": self.gpu_info["provider"]
                }
            else:
                return {
                    "selected_device": "CPU",
                    "reason": f"Workload '{workload_type}' prefers GPU, but no GPU was detected. Falling back to CPU.",
                    "gpu_available": False,
                    "gpu_name": "None",
                    "provider": "CPU"
                }

        if payload_size_kb >= 1024.0 and self.gpu_info["gpu_available"]:
            return {
                "selected_device": "GPU",
                "reason": f"Payload size ({payload_size_kb:.2f} KB) exceeds 1MB threshold. Routing to GPU for throughput.",
                "gpu_available": True,
                "gpu_name": self.gpu_info["gpu_name"],
                "provider": self.gpu_info["provider"]
            }
        else:
            reason = f"Payload size ({payload_size_kb:.2f} KB) below 1MB threshold." if self.gpu_info["gpu_available"] else "No GPU available."
            return {
                "selected_device": "CPU",
                "reason": f"{reason} Routing to CPU for zero setup overhead.",
                "gpu_available": self.gpu_info["gpu_available"],
                "gpu_name": self.gpu_info["gpu_name"],
                "provider": self.gpu_info["provider"]
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
