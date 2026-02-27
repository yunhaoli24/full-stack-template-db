from typing import Any, Protocol, cast
from datetime import datetime

from starlette_context.ctx import context


class TypedContextProtocol(Protocol):
    perf_time: float
    start_time: datetime

    ip: str
    country: str | None
    region: str | None
    city: str | None

    user_agent: str
    os: str | None
    browser: str | None
    device: str | None

    permission: str | None
    language: str
    __request_validation_exception__: Any
    __request_http_exception__: Any
    __request_assertion_error__: Any
    __request_custom_exception__: Any

    def exists(self) -> bool: ...

    def get(self, key: str, default: Any = None) -> Any: ...

    def __getattr__(self, name: str) -> Any: ...

    def __setattr__(self, name: str, value: Any) -> None: ...


class TypedContext:
    def exists(self) -> bool:
        return context.exists()

    def get(self, key: str, default: Any = None) -> Any:
        context_proxy = cast("Any", context)
        return context_proxy.get(key, default)

    def __getattr__(self, name: str) -> Any:
        context_proxy = cast("Any", context)
        return context_proxy.get(name)

    def __setattr__(self, name: str, value: Any) -> None:
        context[name] = value


ctx = cast("TypedContextProtocol", TypedContext())
