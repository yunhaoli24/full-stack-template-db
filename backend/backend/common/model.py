from typing import Annotated
from datetime import datetime

from sqlalchemy import Text, DateTime, BigInteger, TypeDecorator
from sqlalchemy.orm import Mapped, DeclarativeBase, MappedAsDataclass, declared_attr, mapped_column
from sqlalchemy.engine import Dialect
from sqlalchemy.ext.asyncio import AsyncAttrs

from backend.utils.timezone import timezone


id_key = Annotated[
    int,
    mapped_column(
        BigInteger,
        primary_key=True,
        unique=True,
        index=True,
        autoincrement=True,
        sort_order=-999,
        comment="主键 ID",
    ),
]


class UniversalText(TypeDecorator[str]):
    """（长）文本类型."""

    impl = Text
    cache_ok = True

    def process_bind_param(self, value: str | None, dialect: Dialect) -> str | None:
        return value

    def process_result_value(self, value: str | None, dialect: Dialect) -> str | None:
        return value


class TimeZone(TypeDecorator[datetime]):
    """时区感知类型."""

    impl = DateTime(timezone=True)
    cache_ok = True

    @property
    def python_type(self) -> type[datetime]:
        return datetime

    def process_bind_param(self, value: datetime | None, dialect: Dialect) -> datetime | None:
        if value is not None and value.utcoffset() != timezone.now().utcoffset():
            # TODO 处理夏令时偏移
            value = timezone.from_datetime(value)
        return value

    def process_result_value(self, value: datetime | None, dialect: Dialect) -> datetime | None:
        if value is not None and value.tzinfo is None:
            value = value.replace(tzinfo=timezone.tz_info)
        return value


# Mixin: 一种面向对象编程概念, 使结构变得更加清晰, `Wiki <https://en.wikipedia.org/wiki/Mixin/>`__
class UserMixin(MappedAsDataclass):
    """用户 Mixin 数据类."""

    created_by: Mapped[int] = mapped_column(sort_order=998, comment="创建者")
    updated_by: Mapped[int | None] = mapped_column(init=False, default=None, sort_order=998, comment="修改者")


class DateTimeMixin(MappedAsDataclass):
    """日期时间 Mixin 数据类."""

    created_time: Mapped[datetime] = mapped_column(
        TimeZone,
        init=False,
        default_factory=timezone.now,
        sort_order=999,
        comment="创建时间",
    )
    updated_time: Mapped[datetime | None] = mapped_column(
        TimeZone,
        init=False,
        onupdate=timezone.now,
        sort_order=999,
        comment="更新时间",
    )


class MappedBase(AsyncAttrs, DeclarativeBase):
    """声明式基类, 作为所有基类或数据模型类的父类而存在.

    `AsyncAttrs <https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html#sqlalchemy.ext.asyncio.AsyncAttrs>`__

    `DeclarativeBase <https://docs.sqlalchemy.org/en/20/orm/declarative_config.html>`__

    `mapped_column() <https://docs.sqlalchemy.org/en/20/orm/mapping_api.html#sqlalchemy.orm.mapped_column>`__
    """

    @declared_attr.directive  # pyright: ignore
    def __tablename__(self) -> str:
        """生成表名."""
        return self.__name__.lower()

    @declared_attr.directive  # pyright: ignore
    def __table_args__(self) -> dict[str, str]:
        """表配置."""
        return {"comment": self.__doc__ or ""}


class DataClassBase(MappedAsDataclass, MappedBase):
    """声明性数据类基类, 带有数据类集成, 允许使用更高级配置, 但你必须注意它的一些特性, 尤其是和 DeclarativeBase 一起使用时.

    `MappedAsDataclass <https://docs.sqlalchemy.org/en/20/orm/dataclasses.html#orm-declarative-native-dataclasses>`__
    """

    __abstract__ = True


class Base(DataClassBase, DateTimeMixin):
    """声明性数据类基类, 带有数据类集成, 并包含 MiXin 数据类基础表结构."""

    __abstract__ = True
