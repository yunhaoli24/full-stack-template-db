from typing import Any

from pydantic import BaseModel, ConfigDict


class ChatCompletionPayload(BaseModel):
    model: str | None = None
    stream: bool | None = None

    model_config = ConfigDict(extra="allow")

    def to_payload(self) -> dict[str, Any]:
        return self.model_dump(exclude_none=True)
