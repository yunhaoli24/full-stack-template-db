from typing import Any

from sqlalchemy.orm import Session

class SessionManager:
    prepared: bool

    def __init__(self) -> None: ...
    def session_factory(
        self,
        dburi: str | None = ...,
        short_lived_sessions: bool = ...,
        **kwargs: Any,  # noqa: ANN401
    ) -> Session: ...
