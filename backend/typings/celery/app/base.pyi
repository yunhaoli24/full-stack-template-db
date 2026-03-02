from typing import Any
from collections.abc import Callable

class _Loader:
    override_backends: dict[str, str]

class _Inspect:
    def registered(self) -> dict[str, list[str]] | None: ...

class _Control:
    def ping(self, *args: Any, **kwargs: Any) -> Any: ...  # noqa: ANN401
    def inspect(self, *args: Any, **kwargs: Any) -> _Inspect: ...  # noqa: ANN401
    def revoke(self, task_id: str, *args: Any, **kwargs: Any) -> None: ...  # noqa: ANN401

class Celery:
    conf: Any
    loader: _Loader
    control: _Control
    tasks: dict[str, Any]
    backend: Any

    def __init__(self, main: str, **kwargs: Any) -> None: ...  # noqa: ANN401
    def autodiscover_tasks(self, packages: list[str]) -> None: ...
    def task(self, __func: Callable[..., Any] | None = ..., /, name: str | None = ..., **kwargs: Any) -> Any: ...  # noqa: ANN401
