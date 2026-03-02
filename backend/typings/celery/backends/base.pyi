from typing import Any

class BaseBackend:
    app: Any
    expires: float

    def __init__(
        self,
        app: Any = ...,  # noqa: ANN401
        serializer: str | None = ...,
        max_cached_results: int | None = ...,
        accept: list[str] | None = ...,
        expires: float | None = ...,
        expires_type: Any = ...,  # noqa: ANN401
        url: str | None = ...,
        **kwargs: Any,  # noqa: ANN401
    ) -> None: ...
    def decode(self, payload: Any) -> Any: ...  # noqa: ANN401
    def meta_from_decoded(self, meta: Any) -> dict[str, Any]: ...  # noqa: ANN401
    def _get_result_meta(
        self,
        result: Any,  # noqa: ANN401
        state: str,
        traceback: str | None,
        request: Any,  # noqa: ANN401
        format_date: bool = ...,
        encode: bool = ...,
    ) -> dict[str, Any]: ...
    def __reduce__(
        self,
        args: tuple[Any, ...] = ...,
        kwargs: dict[str, Any] | None = ...,
    ) -> Any: ...  # noqa: ANN401
