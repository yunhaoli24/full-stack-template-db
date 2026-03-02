from typing import Any, TypeVar
from collections.abc import Callable

_F = TypeVar("_F", bound=Callable[..., Any])

class _Signal:
    def connect(self, func: _F) -> _F: ...

beat_init: _Signal
