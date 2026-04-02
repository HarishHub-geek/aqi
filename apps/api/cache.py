"""
In-memory cache with Redis fallback for API response caching.
"""

import json
import time
import logging
from typing import Any, Optional
from functools import wraps

logger = logging.getLogger(__name__)

# In-memory cache store
_cache: dict = {}
_cache_expiry: dict = {}


class Cache:
    """Simple in-memory cache with TTL support."""
    
    def __init__(self):
        self._store = {}
        self._expiry = {}
    
    async def get(self, key: str) -> Optional[Any]:
        """Get a cached value by key."""
        if key in self._store:
            if key in self._expiry and time.time() > self._expiry[key]:
                del self._store[key]
                del self._expiry[key]
                return None
            return self._store[key]
        return None
    
    async def set(self, key: str, value: Any, ttl: int = 300) -> None:
        """Set a cached value with TTL in seconds."""
        self._store[key] = value
        self._expiry[key] = time.time() + ttl
    
    async def delete(self, key: str) -> None:
        """Delete a cached value."""
        self._store.pop(key, None)
        self._expiry.pop(key, None)
    
    async def clear(self) -> None:
        """Clear all cached values."""
        self._store.clear()
        self._expiry.clear()
    
    def cleanup(self):
        """Remove expired entries."""
        now = time.time()
        expired_keys = [k for k, v in self._expiry.items() if now > v]
        for key in expired_keys:
            self._store.pop(key, None)
            self._expiry.pop(key, None)


# Global cache instance
cache = Cache()


def cached(ttl: int = 300, key_prefix: str = ""):
    """Decorator to cache function results."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Build cache key from function name and arguments
            cache_key = f"{key_prefix}:{func.__name__}:{str(args)}:{str(sorted(kwargs.items()))}"
            
            # Try to get from cache
            result = await cache.get(cache_key)
            if result is not None:
                logger.debug(f"Cache hit: {cache_key}")
                return result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            if result is not None:
                await cache.set(cache_key, result, ttl)
                logger.debug(f"Cache set: {cache_key} (TTL: {ttl}s)")
            
            return result
        return wrapper
    return decorator
