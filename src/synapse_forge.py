import os
import sys
import json
import shutil
import subprocess
from pathlib import Path
from typing import List, Dict

class SynapseEngineHybridEngine:
    def __init__(self, global_config_dir: str = "~/.gemini/config/skills", local_workspace_dir: str = ".agents/skills"):
        # Resolve paths correctly
        if global_config_dir.startswith("~"):
            self.global_dir = Path.home() / global_config_dir.replace("~/", "").replace("~", "")
        else:
            self.global_dir = Path(global_config_dir)
            
        self.local_dir = Path(local_workspace_dir)
        self.bmad_core_source = Path(".bmad-core")

    def _parse_frontmatter(self, file_content: str) -> Dict:
        """
        Parses YAML frontmatter manually to avoid external dependencies like PyYAML.
        """
        metadata = {}
        if not file_content.startswith('---'):
            return metadata
        parts = file_content.split('---', 2)
        if len(parts) >= 3:
            yaml_block = parts[1]
            for line in yaml_block.split('\n'):
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if ':' in line:
                    key, val = line.split(':', 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    if val.lower() == 'true':
                        metadata[key] = True
                    elif val.lower() == 'false':
                        metadata[key] = False
                    else:
                        metadata[key] = val
        return metadata

    def _deploy_skill_isolated(self, target_directory: Path, role_name: str, skill_content: str, metadata: Dict):
        """
        Deploys a skill manifest (SKILL.md) in the target directory folder.
        """
        skill_folder = target_directory / role_name
        skill_folder.mkdir(parents=True, exist_ok=True)
        
        skill_file = skill_folder / "SKILL.md"
        
        # Format frontmatter back into YAML string
        yaml_lines = ["---"]
        for k, v in metadata.items():
            if isinstance(v, bool):
                yaml_lines.append(f"{k}: {str(v).lower()}")
            else:
                yaml_lines.append(f"{k}: {v}")
        yaml_lines.append("---")
        yaml_header = "\n".join(yaml_lines) + "\n\n"
        
        with open(skill_file, 'w', encoding='utf-8') as f:
            f.write(yaml_header)
            f.write(skill_content)
            
        print(f"[OK] Deployed skill: {role_name} -> {skill_file}")

    def _forge_methodology_scaffolding(self):
        """
        Creates semantic taxonomy directories and provides the MADR 4.0.0 template.
        """
        docs_dir = Path("00_docs")
        folders = ["01_prd", "02_tech_specs", "03_rules", "04_adrs"]
        for folder in folders:
            (docs_dir / folder).mkdir(parents=True, exist_ok=True)
            
        print("[OK] Created Semantic Taxonomy Directories under 00_docs/")

        # Deploy MADR 4.0.0 template if it doesn't exist
        template_file = docs_dir / "04_adrs" / "0001-template-madr.md"
        if not template_file.exists():
            madr_template = """---
status: Proposed
date: 2026-06-29
decision_maker: AI Agent & Tech Lead
---

# [Short Title of the Decision]

## Context and Problem Statement

[Describe the context and the problem you are solving...]

## Decision Outcome

* Chosen Option: [Option Name]
* Status: Proposed (Proposed | Accepted | Superseded)

### Consequences

* Good: [Positive impact...]
* Bad: [Negative tradeoffs...]
"""
            with open(template_file, 'w', encoding='utf-8') as f:
                f.write(madr_template)
            print(f"[OK] Deployed MADR 4.0.0 Template -> {template_file}")

    def _forge_graphify_integration(self):
        """
        Validates, installs, and runs Graphify for repository mapping.
        """
        print("Checking Graphify integration...")
        
        # 1. Determine graphify command/executable path
        graphify_cmd = "graphify"
        
        # Check standard PATH
        graphify_installed = False
        try:
            result = subprocess.run("graphify --version", shell=True, capture_output=True, text=True, check=False)
            if result.returncode == 0 or "graphify" in result.stdout.lower():
                graphify_installed = True
        except Exception:
            graphify_installed = False

        # If not in standard PATH, check local .local/bin
        if not graphify_installed:
            local_bin_graphify = Path.home() / ".local" / "bin" / ("graphify.exe" if os.name == "nt" else "graphify")
            if local_bin_graphify.exists():
                graphify_cmd = str(local_bin_graphify)
                graphify_installed = True
                print(f"[INFO] Found graphify at local bin path: {graphify_cmd}")

        # Try to install if not found anywhere
        if not graphify_installed:
            print("[WARN] Graphify CLI not found in PATH or local directory.")
            print("[INFO] Attempting to install graphify locally via pip...")
            try:
                subprocess.run([sys.executable, "-m", "pip", "install", "graphify"], check=True)
                graphify_installed = True
                print("[OK] Graphify installed successfully via pip.")
            except Exception as e:
                print(f"[ERROR] Failed to install graphify via pip: {e}")
                print("[INFO] Attempting to install graphifyy via local uv...")
                try:
                    # Try using uv if present in .venv/Scripts (or virtual environments)
                    uv_exe = Path(".venv") / ("Scripts" if os.name == "nt" else "bin") / ("uv.exe" if os.name == "nt" else "uv")
                    if uv_exe.exists():
                        subprocess.run([str(uv_exe), "tool", "install", "graphifyy"], check=True)
                        local_bin_graphify = Path.home() / ".local" / "bin" / ("graphify.exe" if os.name == "nt" else "graphify")
                        if local_bin_graphify.exists():
                            graphify_cmd = str(local_bin_graphify)
                            graphify_installed = True
                            print(f"[OK] Graphify installed successfully via uv and mapped to: {graphify_cmd}")
                except Exception as ex_uv:
                    print(f"[ERROR] Failed to install via uv: {ex_uv}")
                    print("[INFO] Please install it manually using: uv tool install graphifyy")
                
        # 2. Run graphify update to generate graphify-out if possible
        if graphify_installed:
            print(f"[INFO] Running graphify update . to map repository topology using command '{graphify_cmd}'...")
            try:
                res = subprocess.run(f'"{graphify_cmd}" update .', shell=True, capture_output=True, text=True, check=False)
                if res.returncode == 0:
                    print("[OK] Graphify mapping generated successfully in graphify-out/")
                else:
                    print(f"[WARN] Graphify update returned code {res.returncode}. Output: {res.stderr or res.stdout}")
            except Exception as e:
                print(f"[WARN] Could not compile graphify map: {e}")
        else:
            print("[WARN] Skipping graphify generation due to missing installation.")

        # 3. Ensure graphify-out/ is in gitignore
        gitignore = Path(".gitignore")
        if gitignore.exists():
            with open(gitignore, "r", encoding="utf-8") as f:
                content = f.read()
            if "graphify-out" not in content:
                print("[INFO] Appending graphify-out/ to .gitignore...")
                with open(gitignore, "a", encoding="utf-8") as f:
                    f.write("\n# Graphify outputs\ngraphify-out/\n")
                print("[OK] Added graphify-out/ to .gitignore")

    def forge_hybrid_skills(self, required_roles_subset: List[str] = None):
        """
        Orchestrates skill deployment based on metadata scope.
        """
        self._forge_methodology_scaffolding()
        self._forge_graphify_integration()
        
        agents_dir = self.bmad_core_source / "agents"
        if not agents_dir.exists():
            print(f"[WARN] Source directory {agents_dir} does not exist.")
            return

        if not required_roles_subset:
            required_roles_subset = [f.stem for f in agents_dir.glob("*.md")]
            
        for role in required_roles_subset:
            source_file = agents_dir / f"{role}.md"
            if not source_file.exists():
                print(f"[WARN] Source agent file {source_file} missing. Skipping.")
                continue

            with open(source_file, 'r', encoding='utf-8') as f:
                file_content = f.read()
                
            metadata = self._parse_frontmatter(file_content)
            
            # Extract content without frontmatter
            if file_content.startswith('---'):
                parts = file_content.split('---', 2)
                content_body = parts[2].strip() if len(parts) >= 3 else file_content
            else:
                content_body = file_content.strip()
            
            # Hybrid scoping decision
            if metadata.get("scope") == "global" or role == "bmad-master":
                try:
                    self._deploy_skill_isolated(self.global_dir, role, content_body, metadata)
                except Exception as e:
                    print(f"[WARN] Could not deploy global skill {role} (possibly due to OS permissions): {e}")
                    print(f"[INFO] Deploying it locally as fallback.")
                    self._deploy_skill_isolated(self.local_dir, role, content_body, metadata)
            else:
                self._deploy_skill_isolated(self.local_dir, role, content_body, metadata)

if __name__ == "__main__":
    print("Initiating Synapse Engine Hybrid Compilation in Antigravity Context...")
    forge = SynapseEngineHybridEngine()
    forge.forge_hybrid_skills(["bmad-master", "local-guardrails-policy"])

