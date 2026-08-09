"""
Synapse Engine - Quota Manager Package
Provides dynamic AI model rate limit tracking, sliding window timestamp quota budget calculation,
task complexity weight estimation, and automatic hardware/model interceptors.
"""

from .tracker import DynamicQuotaRegistry, QuotaWindowTracker
from .estimator import TaskWeightEstimator
from .interceptor import QuotaInterceptor

__all__ = [
    "DynamicQuotaRegistry",
    "QuotaWindowTracker",
    "TaskWeightEstimator",
    "QuotaInterceptor"
]
