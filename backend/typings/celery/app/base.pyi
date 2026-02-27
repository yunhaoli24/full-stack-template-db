from typing import Any

class _Loader:
    override_backends: dict[str, str]

class _Inspect:
    def registered(self) -> dict[str, list[str]] | None: ...

class _Control:
    def ping(self, *args: Any, **kwargs: Any) -> Any: ...
    def inspect(self, *args: Any, **kwargs: Any) -> _Inspect: ...
    def revoke(self, task_id: str, *args: Any, **kwargs: Any) -> None: ...

class Celery:
    conf: Any
    loader: _Loader
    control: _Control
    tasks: dict[str, Any]
    backend: Any

    def __init__(self, main: str, **kwargs: Any) -> None: ...
    def autodiscover_tasks(self, packages: list[str]) -> None: ...
