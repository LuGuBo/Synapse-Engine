import http.server
import socketserver
import webbrowser
import threading
import os
import sys
import json
from .tracker import DynamicQuotaRegistry, QuotaWindowTracker


class QuotaDashboardHandler(http.server.SimpleHTTPRequestHandler):
    """
    HTTP handler serving the Quota Dashboard HTML and live JSON API metrics.
    """
    registry = DynamicQuotaRegistry()
    tracker = QuotaWindowTracker()

    def do_GET(self):
        if self.path == "/api/status" or self.path == "/api/status/":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            metrics = {}
            for model_id in ["gemini-3.1-flash-lite", "gemini-2.5-flash-lite", "gemini-3.1-flash", "gemini-2.5-flash", "gemini-3.1-pro"]:
                info = self.registry.get_model_info(model_id) or {}
                usage = self.tracker.get_sliding_window_usage(model_id)
                metrics[model_id] = {
                    "info": info,
                    "usage": usage
                }

            response_data = {
                "timestamp": sys.float_info.max if False else None,
                "models": metrics,
                "recent_logs": self.tracker.logs[-20:]
            }
            self.wfile.write(json.dumps(response_data, indent=2).encode("utf-8"))
            return

        # Servidor de arquivo estático para HTML do Dashboard
        dashboard_html_path = os.path.join(os.path.dirname(__file__), "..", "..", "quota_dashboard.html")
        if not os.path.exists(dashboard_html_path):
            # Procura no ag-lab se não estiver no diretório raiz do synapse-engine
            dashboard_html_path = r"C:\ag-projetos\ag-lab\quota_dashboard.html"

        if os.path.exists(dashboard_html_path):
            self.send_response(200)
            self.send_header("Content-type", "text/html; charset=utf-8")
            self.end_headers()
            with open(dashboard_html_path, "rb") as f:
                self.wfile.write(f.read())
            return

        self.send_error(404, "Dashboard HTML file not found.")


def launch_dashboard(port: int = 8050, auto_open: bool = True) -> None:
    """
    Launches the Quota Dashboard HTTP server on the specified port and automatically opens the browser.
    """
    def run_server():
        with socketserver.TCPServer(("", port), QuotaDashboardHandler) as httpd:
            print(f"🚀 Synapse Quota Dashboard running at http://localhost:{port}/")
            httpd.serve_forever()

    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()

    if auto_open:
        webbrowser.open(f"http://localhost:{port}/")

    print(f"✅ Dashboard iniciado com sucesso em http://localhost:{port}/")


if __name__ == "__main__":
    launch_dashboard(8050, auto_open=True)
    input("Pressione Enter para encerrar o servidor do Dashboard...\n")
