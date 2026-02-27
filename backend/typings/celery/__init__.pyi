from typing import Any, TypeVar, overload
from collections.abc import Callable

from . import schedules as schedules

_F = TypeVar("_F", bound=Callable[..., Any])

class _States:
    PENDING: str

states: _States
current_app: Any
celery: Any

class Task:
    autoretry_for: tuple[type[BaseException], ...]
    max_retries: int

@overload
def shared_task[F: Callable[..., Any]](
    __func: _F,
    *args: Any,
    **kwargs: Any,
) -> _F: ...
@overload
def shared_task(
    __func: None = ...,
    *args: Any,
    **kwargs: Any,
) -> Callable[[_F], _F]: ...
