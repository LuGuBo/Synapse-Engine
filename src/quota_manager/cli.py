import os
import sys
import json
import argparse

# Force UTF-8 stdout/stderr encoding on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure src directory is in sys.path for direct execution
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    from quota_manager.tracker import DynamicQuotaRegistry, QuotaWindowTracker
    from quota_manager.estimator import TaskWeightEstimator
    from quota_manager.dashboard import launch_dashboard
except ImportError:
    from tracker import DynamicQuotaRegistry, QuotaWindowTracker
    from estimator import TaskWeightEstimator
    from dashboard import launch_dashboard


def main():
    parser = argparse.ArgumentParser(description="Synapse Engine Quota Manager & Task Weight Estimator CLI")
    subparsers = parser.add_subparsers(dest="command", help="Subcommand to execute")

    # Command: status
    subparsers.add_parser("status", help="Displays model rate limits and current sliding window usage")

    # Command: estimate
    estimate_parser = subparsers.add_parser("estimate", help="Estimates task complexity weight and recommends an AI model")
    estimate_parser.add_argument("task", type=str, help="Task description string")
    estimate_parser.add_argument("--persona", type=str, default="DEVELOPER", help="Active BMAD persona")
    estimate_parser.add_argument("--nodes", type=int, default=0, help="AST connected nodes count")

    # Command: dashboard
    dash_parser = subparsers.add_parser("dashboard", help="Launches local HTTP server and opens Quota Dashboard")
    dash_parser.add_argument("--port", type=int, default=8050, help="Port for dashboard server")
    dash_parser.add_argument("--no-open", action="store_true", help="Disable automatic browser opening")

    args = parser.parse_args()

    registry = DynamicQuotaRegistry()
    tracker = QuotaWindowTracker()
    estimator = TaskWeightEstimator(registry, tracker)

    if args.command == "status":
        print("⚡ Synapse Engine - Quota & Model Status:")
        for model_id in ["gemini-3.1-flash-lite", "gemini-2.5-flash-lite", "gemini-3.1-flash", "gemini-2.5-flash", "gemini-3.1-pro"]:
            info = registry.get_model_info(model_id) or {}
            usage = tracker.get_sliding_window_usage(model_id)
            avail = info.get("is_available", True)
            status_symbol = "[OK]" if avail else "[OFF]"
            print(f"  {status_symbol} [{info.get('raw_name', model_id)}]: RPD Limit: {info.get('rpd_limit')}, Used 24h: {usage['rpd_24h']} (RPM 60s: {usage['rpm_60s']}/{info.get('rpm_limit')})")

    elif args.command == "estimate":
        res = estimator.estimate(
            task_description=args.task,
            active_persona=args.persona,
            ast_connected_nodes=args.nodes
        )
        print("⚡ Task Complexity Weight Analysis:")
        print(f"  • Task: '{res['task_description']}'")
        print(f"  • Weight Score: {res['weight_score']}/10 ({res['tier_label']})")
        print(f"  • Recommended Model: {res['selected_model']}")
        if res['model_degraded']:
            print("  • Warning: Model Degraded (fallback applied)")
        print("  • Reasons:")
        for r in res['evaluation_reasons']:
            print(f"    - {r}")

    elif args.command == "dashboard":
        auto_open = not args.no_open
        launch_dashboard(args.port, auto_open=auto_open)
        import time
        while True:
            time.sleep(1)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
