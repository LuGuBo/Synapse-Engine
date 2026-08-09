import sys
from pathlib import Path

# Add workspace root to python path for pytest
workspace_dir = Path(__file__).parent.parent
sys.path.insert(0, str(workspace_dir.resolve()))
