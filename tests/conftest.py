import sys
from pathlib import Path

# Add src to python path for pytest
src_dir = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_dir.resolve()))
