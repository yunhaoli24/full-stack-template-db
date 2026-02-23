from datetime import datetime
from typing import Annotated, Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field, validate_email

from backend.utils.timezone import timezone

CustomPhoneNumber = Annotated[str, Field(pattern=r'^1[3-9]\d{9}$')]


def serialize_datetime(value: datetime) -> str:
    current_value = (
        timezone.from_datetime(value) if value.tzinfo is not None and value.tzinfo != timezone.tz_info else value
    )
    return timezone.to_str(current_value)


class CustomEmailStr(EmailStr):
    """自定义邮箱类型"""

    @classmethod
    def _validate(cls, input_value: str, /) -> str:
        return validate_email(input_value)[1] if input_value else ''


class SchemaBase(BaseModel):
    """基础模型配置"""

    model_config = ConfigDict(
        use_enum_values=True,
        json_encoders={
            datetime: serialize_datetime,
        },
    )


def ser_string(value: Any) -> str | None:
    if value:
        return str(value)
    return value
