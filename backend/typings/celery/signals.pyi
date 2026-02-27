from typing import Any, Callable, TypeVar

_F = TypeVar('_F', bound=Callable[..., Any])

class _Signal:
    def connect(self, func: _F) -> _F: ...

beat_init: _Signal
