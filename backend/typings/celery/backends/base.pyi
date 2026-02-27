from typing import Any

class BaseBackend:
    app: Any
    expires: float

    def __init__(
        self,
        app: Any = ...,
        serializer: str | None = ...,
        max_cached_results: int | None = ...,
        accept: list[str] | None = ...,
        expires: float | None = ...,
        expires_type: Any = ...,
        url: str | None = ...,
        **kwargs: Any,
    ) -> None: ...
    def decode(self, payload: Any) -> Any: ...
    def meta_from_decoded(self, meta: Any) -> dict[str, Any]: ...
    def _get_result_meta(
        self,
        result: Any,
        state: str,
        traceback: str | None,
        request: Any,
        format_date: bool = ...,
        encode: bool = ...,
    ) -> dict[str, Any]: ...
    def __reduce__(
        self,
        args: tuple[Any, ...] = ...,
        kwargs: dict[str, Any] | None = ...,
    ) -> Any: ...
