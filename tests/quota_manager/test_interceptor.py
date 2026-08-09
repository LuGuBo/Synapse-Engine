import pytest
from src.quota_manager.interceptor import QuotaInterceptor

def test_interceptor_check():
    interceptor = QuotaInterceptor()
    res = interceptor.intercept_request("Refactor backend AST node", active_persona="ARCHITECT")
    assert res is not None
