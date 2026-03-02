from typing import Any

class AsyncOperator:
    def __init__(self, scheme: str, **kwargs: Any) -> None: ...  # noqa: ANN401
    async def write(self, path: str | None, data: bytes) -> None: ...
