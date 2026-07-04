#!/usr/bin/env python3
import os
import sys
import json
import argparse
import re

def calculate_niche_viability(us, pm, cl, ac):
    """
    Calculates the Niche Viability (Vn).
    Formula: Vn = (US * PM) / (CL * AC)
    Raises ValueError if cl or ac are <= 0.
    """
    if cl <= 0 or ac <= 0:
        raise ValueError("Denominator parameters CL and AC must be strictly greater than 0.")
    return (us * pm) / (cl * ac)

def audit_file_for_exception_silencing(file_path):
    """
    Scans a Python file for generic exceptions followed by pass or continue
    within the next two active lines.
    Returns a list of violations, where each violation is a dict with keys:
    - line_number: line number of the except clause (1-indexed)
    - line_content: content of the except clause
    - silencer_line: line number of the silencer
    - silencer_content: content of the silencer
    """
    violations = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        # If we cannot read the file, skip it or report error
        return violations

    for i, line in enumerate(lines):
        clean_line = line.split('#')[0].strip()
        if clean_line == 'except:' or clean_line == 'except Exception:':
            # Look ahead for the next 2 active lines
            active_lines = []
            for j in range(i + 1, len(lines)):
                clean_ahead = lines[j].split('#')[0].strip()
                if clean_ahead:  # Active line (not empty)
                    active_lines.append((j + 1, clean_ahead, lines[j].strip()))
                if len(active_lines) == 2:
                    break
            
            # Check if any of the next 2 active lines is pass or continue
            for line_num, clean_val, raw_val in active_lines:
                if clean_val in ('pass', 'continue'):
                    violations.append({
                        "line_number": i + 1,
                        "line_content": line.strip(),
                        "silencer_line": line_num,
                        "silencer_content": raw_val
                    })
                    break  # Flag once per except block
    return violations

def run_codebase_audit(root_dir):
    """
    Recursively scans the directory for Python files, excluding system/temp dirs.
    """
    excluded_dirs = {'node_modules', '.git', '.agents', '.agent', 'venv', '.venv', '__pycache__', '.playground', 'tmp'}
    scanned_files_count = 0
    all_violations = []

    for root, dirs, files in os.walk(root_dir):
        # Exclude directories in-place to prevent os.walk from entering them
        dirs[:] = [d for d in dirs if d not in excluded_dirs]
        
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                # Make path relative to root_dir for clean output
                rel_path = os.path.relpath(file_path, root_dir)
                # Convert backslashes to forward slashes for cross-platform consistency
                rel_path = rel_path.replace('\\', '/')
                scanned_files_count += 1
                violations = audit_file_for_exception_silencing(file_path)
                if violations:
                    all_violations.append({
                        "file": rel_path,
                        "violations": violations
                    })
                    
    return scanned_files_count, all_violations

def main():
    parser = argparse.ArgumentParser(description="BMAD Harness Custom Skill: grill-and-evolve validator")
    parser.add_argument('--audit-only', action='store_true', help="Only run static codebase exception audit")
    parser.add_argument('--us', type=float, default=7.5, help="Potential Users (Scale)")
    parser.add_argument('--pm', type=float, default=8.0, help="Profit Margin")
    parser.add_argument('--cl', type=float, default=2.5, help="Customer Acquisition Cost (CAC)")
    parser.add_argument('--ac', type=float, default=3.0, help="Cost of Servicing")
    
    args = parser.parse_args()
    
    # Run the audit
    scanned_count, violations = run_codebase_audit(os.getcwd())
    
    # Calculate strategic metrics
    niche_viability = 0.0
    approved_for_implementation = False
    calculation_error = None
    
    try:
        niche_viability = calculate_niche_viability(args.us, args.pm, args.cl, args.ac)
        approved_for_implementation = (niche_viability >= 3.0)
    except ValueError as e:
        calculation_error = str(e)
        approved_for_implementation = False
        
    # Build output JSON
    result = {
        "strategic_metrics": {
            "us": args.us,
            "pm": args.pm,
            "cl": args.cl,
            "ac": args.ac,
            "niche_viability": round(niche_viability, 4) if calculation_error is None else None,
            "approved_for_implementation": approved_for_implementation
        },
        "codebase_audit": {
            "scanned_files_count": scanned_count,
            "violations": violations
        }
    }
    
    if calculation_error:
        result["strategic_metrics"]["error"] = calculation_error

    # Print output to stdout in JSON format
    print(json.dumps(result, indent=2))
    
    # Exit code determination
    if violations:
        sys.exit(1)
        
    if not args.audit_only:
        if calculation_error or not approved_for_implementation:
            sys.exit(2)
            
    sys.exit(0)

if __name__ == '__main__':
    main()
