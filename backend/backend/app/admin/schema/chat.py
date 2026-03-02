"""Chat."""

from typing import Any

from pydantic import BaseModel, ConfigDict


class ChatCompletionPayload(BaseModel):
    """Chat completion payload."""

    model: str | None = None
    stream: bool | None = None

    model_config = ConfigDict(extra="allow")

    def to_payload(self) -> dict[str, Any]:
        """Convert to payload dictionary."""
        return self.model_dump(exclude_none=True)
