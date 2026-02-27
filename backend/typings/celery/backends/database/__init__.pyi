from contextlib import AbstractContextManager
from typing import Any, Callable, TypeVar

_F = TypeVar('_F', bound=Callable[..., Any])

def retry(fun: _F) -> _F: ...
def session_cleanup(session: Any) -> AbstractContextManager[None]: ...
