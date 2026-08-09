import pytest
from src.quota_manager.mcp_server import QuotaMCPServer

def test_mcp_server_quota_status():
    server = QuotaMCPServer()
    status = server.get_quota_status()
    assert status is not None
    assert "status" in status

def test_mcp_server_estimate_task_weight():
    server = QuotaMCPServer()
    res = server.estimate_task_weight("Fix bug in parser", active_persona="DEVELOPER", ast_connected_nodes=2)
    assert res is not None
