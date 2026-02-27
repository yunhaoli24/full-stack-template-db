from typing import Any, TypeVar
from contextlib import AbstractContextManager
from collections.abc import Callable

_F = TypeVar("_F", bound=Callable[..., Any])

def retry[F: Callable[..., Any]](fun: _F) -> _F: ...
def session_cleanup(session: Any) -> AbstractContextManager[None]: ...
