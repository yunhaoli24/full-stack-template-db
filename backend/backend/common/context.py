"""Context."""

from typing import Any, Protocol, cast
from datetime import datetime

from starlette_context.ctx import context


class TypedContextProtocol(Protocol):
    """类型化上下文协议."""

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

    def exists(self) -> bool: ...  # noqa: D102

    def get(self, key: str, default: Any = None) -> Any: ...  # noqa: ANN401, D102

    def __getattr__(self, name: str) -> Any: ...  # noqa: ANN401, D105

    def __setattr__(self, name: str, value: Any) -> None: ...  # noqa: ANN401, D105


class TypedContext:
    """类型化上下文."""

    def exists(self) -> bool:  # noqa: D102
        return context.exists()

    def get(self, key: str, default: Any = None) -> Any:  # noqa: ANN401, D102
        context_proxy = cast("Any", context)
        return context_proxy.get(key, default)

    def __getattr__(self, name: str) -> Any:  # noqa: ANN401, D105
        context_proxy = cast("Any", context)
        return context_proxy.get(name)

    def __setattr__(self, name: str, value: Any) -> None:  # noqa: ANN401, D105
        context[name] = value


ctx = cast("TypedContextProtocol", TypedContext())
