import json
import os
import re
import time
import glob
import threading
from typing import Dict, Any, Optional, List, Tuple


class DynamicQuotaRegistry:
    """
    Dynamic quota registry for Synapse Engine.
    Fetches real rate limits and model metadata from:
    1. GCP / Google AI Studio captured state tables.
    2. Model availability verification checks.
    3. Dynamic pattern calculation fallback.
    """

    def __init__(self, workspace_root: Optional[str] = None):
        self._lock = threading.RLock()
        self.workspace_root = workspace_root or os.getcwd()
        self._registry: Dict[str, Dict[str, Any]] = {}
        self.refresh_registry()

    def _parse_single_val(self, val_str: str) -> int:
        if not val_str or val_str.strip() in ("-", "ilimitado", "Ilimitado", "unlimited"):
            return 0
        s = val_str.strip().upper()
        multiplier = 1
        if "M" in s:
            multiplier = 1_000_000
            s = s.replace("M", "")
        elif "K" in s:
            multiplier = 1_000
            s = s.replace("K", "")

        try:
            return int(float(s) * multiplier)
        except ValueError:
            return 0

    def _parse_fraction_val(self, val_str: str) -> Dict[str, Any]:
        s = val_str.strip()
        if not s or s == "-":
            return {"usage": 0, "limit": 0, "limit_raw": "-", "is_unlimited": False, "is_na": True}

        if "/" in s:
            parts = s.split("/")
            usage_str = parts[0].strip()
            limit_str = parts[1].strip()
            usage = self._parse_single_val(usage_str)
            if limit_str.lower() in ("ilimitado", "unlimited"):
                return {"usage": usage, "limit": 999_999_999, "limit_raw": "Ilimitado", "is_unlimited": True, "is_na": False}
            else:
                limit = self._parse_single_val(limit_str)
                return {"usage": usage, "limit": limit, "limit_raw": limit_str, "is_unlimited": False, "is_na": False}
        else:
            limit = self._parse_single_val(s)
            return {"usage": 0, "limit": limit, "limit_raw": s, "is_unlimited": False, "is_na": False}

    def normalize_model_id(self, model_name: str) -> str:
        clean = model_name.strip().lower()
        clean = re.sub(r"\s*\(.*?\)", "", clean)
        clean = clean.replace(" ", "-")
        return clean

    def parse_markdown_capture_file(self, filepath: str) -> Dict[str, Dict[str, Any]]:
        extracted = {}
        if not os.path.exists(filepath):
            return extracted

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                lines = f.readlines()

            for line in lines:
                parts = [p.strip() for p in line.split("|") if p.strip()]
                if len(parts) < 5:
                    continue

                raw_model_name = parts[0]
                if "modelo" in raw_model_name.lower() or "---" in raw_model_name:
                    continue

                model_id = self.normalize_model_id(raw_model_name)
                rpm_info = self._parse_fraction_val(parts[1])
                tpm_info = self._parse_fraction_val(parts[2])
                rpd_info = self._parse_fraction_val(parts[3])
                status_raw = parts[4] if len(parts) > 4 else "Ativo"

                is_available = "ativo" in status_raw.lower() or "active" in status_raw.lower() or "ok" in status_raw.lower()

                extracted[model_id] = {
                    "raw_name": raw_model_name,
                    "canonical_id": model_id,
                    "rpm_limit": rpm_info["limit"],
                    "tpm_limit": tpm_info["limit"],
                    "rpd_limit": rpd_info["limit"],
                    "rpm_usage": rpm_info["usage"],
                    "tpm_usage": tpm_info["usage"],
                    "rpd_usage": rpd_info["usage"],
                    "is_available": is_available,
                    "status_str": status_raw,
                    "source": os.path.basename(filepath),
                    "last_updated": os.path.getmtime(filepath)
                }
        except Exception:
            pass

        return extracted

    def refresh_registry(self) -> None:
        with self._lock:
            # Sementes padrão oficiais (Gemini Free Tier Rate Limits)
            self._registry = {
                "gemini-3.1-flash-lite": {
                    "raw_name": "Gemini 3.1 Flash Lite",
                    "canonical_id": "gemini-3.1-flash-lite",
                    "rpm_limit": 15,
                    "tpm_limit": 1_000_000,
                    "rpd_limit": 500,
                    "rpm_usage": 0,
                    "tpm_usage": 0,
                    "rpd_usage": 0,
                    "is_available": True,
                    "status_str": "Ativo",
                    "source": "official_seed"
                },
                "gemini-2.5-flash-lite": {
                    "raw_name": "Gemini 2.5 Flash Lite",
                    "canonical_id": "gemini-2.5-flash-lite",
                    "rpm_limit": 15,
                    "tpm_limit": 1_000_000,
                    "rpd_limit": 500,
                    "rpm_usage": 0,
                    "tpm_usage": 0,
                    "rpd_usage": 0,
                    "is_available": True,
                    "status_str": "Ativo",
                    "source": "official_seed"
                },
                "gemini-3.1-flash": {
                    "raw_name": "Gemini 3.1 Flash",
                    "canonical_id": "gemini-3.1-flash",
                    "rpm_limit": 15,
                    "tpm_limit": 1_000_000,
                    "rpd_limit": 250,
                    "rpm_usage": 0,
                    "tpm_usage": 0,
                    "rpd_usage": 0,
                    "is_available": True,
                    "status_str": "Ativo",
                    "source": "official_seed"
                },
                "gemini-2.5-flash": {
                    "raw_name": "Gemini 2.5 Flash",
                    "canonical_id": "gemini-2.5-flash",
                    "rpm_limit": 15,
                    "tpm_limit": 1_000_000,
                    "rpd_limit": 250,
                    "rpm_usage": 0,
                    "tpm_usage": 0,
                    "rpd_usage": 0,
                    "is_available": True,
                    "status_str": "Ativo",
                    "source": "official_seed"
                },
                "gemini-3.1-pro": {
                    "raw_name": "Gemini 3.1 Pro",
                    "canonical_id": "gemini-3.1-pro",
                    "rpm_limit": 2,
                    "tpm_limit": 32_000,
                    "rpd_limit": 50,
                    "rpm_usage": 0,
                    "tpm_usage": 0,
                    "rpd_usage": 0,
                    "is_available": True,
                    "status_str": "Ativo",
                    "source": "official_seed"
                }
            }

            # Procura por capturas markdown no workspace ou diretório de conhecimento do IDE
            search_paths = [
                os.path.join(self.workspace_root, "*.md"),
                os.path.join(self.workspace_root, "00_docs", "*.md"),
                os.path.expanduser(r"~\.gemini\antigravity-ide\knowledge\05_GEMINI_API_LIMITS\artifacts\*.md"),
                r"C:\ag-projetos\gemini_api_limits.md"
            ]

            for pattern in search_paths:
                for filepath in glob.glob(pattern):
                    parsed = self.parse_markdown_capture_file(filepath)
                    for k, v in parsed.items():
                        self._registry[k] = v

    def is_model_available(self, model_name: str) -> Tuple[bool, str]:
        with self._lock:
            canonical = self.normalize_model_id(model_name)
            if canonical not in self._registry:
                return False, f"Model '{model_name}' not registered in GCP state matrix."
            info = self._registry[canonical]
            if not info.get("is_available", True):
                return False, f"Model '{model_name}' is currently unavailable (Status: {info.get('status_str', 'Disabled')})."
            return True, "Model active and available."

    def get_model_info(self, model_name: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            canonical = self.normalize_model_id(model_name)
            return self._registry.get(canonical)


class QuotaWindowTracker:
    """
    Timestamped sliding window quota manager for Synapse Engine.
    Tracks exact request timestamps and token usage over sliding time windows:
    - 60s window for RPM (Requests Per Minute) and TPM (Tokens Per Minute).
    - 86400s (24h) window for RPD (Requests Per Day).
    Preserves audit history to disk for telemetry and quota expenditure estimation.
    """

    def __init__(self, storage_path: Optional[str] = None):
        self._lock = threading.RLock()
        self.storage_path = storage_path or os.path.join(os.getcwd(), ".agents", "quota_tracker.json")
        self.logs: List[Dict[str, Any]] = []
        self._load_state()

    def _load_state(self) -> None:
        with self._lock:
            if os.path.exists(self.storage_path):
                try:
                    with open(self.storage_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        self.logs = data.get("logs", [])
                except Exception:
                    self.logs = []

    def _save_state(self) -> None:
        with self._lock:
            os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
            # Mantém no máximo 5000 registros para evitar estouro de arquivo
            if len(self.logs) > 5000:
                self.logs = self.logs[-5000:]
            try:
                with open(self.storage_path, "w", encoding="utf-8") as f:
                    json.dump({"logs": self.logs, "last_updated": time.time()}, f, indent=2)
            except Exception:
                pass

    def record_usage(self, model_name: str, input_tokens: int = 0, output_tokens: int = 0, is_error: bool = False) -> None:
        with self._lock:
            now = time.time()
            entry = {
                "timestamp": now,
                "model": model_name.strip().lower(),
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "total_tokens": input_tokens + output_tokens,
                "is_error": is_error
            }
            self.logs.append(entry)
            self._save_state()

    def get_sliding_window_usage(self, model_name: str) -> Dict[str, Any]:
        with self._lock:
            now = time.time()
            clean_model = model_name.strip().lower()
            min_window = now - 60.0
            day_window = now - 86400.0

            rpm = 0
            tpm = 0
            rpd = 0
            total_tokens_24h = 0

            for entry in self.logs:
                if entry.get("model") != clean_model:
                    continue

                ts = entry.get("timestamp", 0)
                tokens = entry.get("total_tokens", 0)

                if ts >= min_window:
                    rpm += 1
                    tpm += tokens

                if ts >= day_window:
                    rpd += 1
                    total_tokens_24h += tokens

            return {
                "model": clean_model,
                "timestamp": now,
                "rpm_60s": rpm,
                "tpm_60s": tpm,
                "rpd_24h": rpd,
                "total_tokens_24h": total_tokens_24h
            }
