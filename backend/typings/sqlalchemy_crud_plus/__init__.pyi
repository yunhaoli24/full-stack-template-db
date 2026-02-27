from collections.abc import Sequence
from typing import Any, Generic, TypeVar

from sqlalchemy import Select
from sqlalchemy.ext.asyncio import AsyncSession

ModelT = TypeVar('ModelT')

class JoinConfig:
    model: Any
    join_on: Any
    fill_result: bool
    join_type: str

    def __init__(
        self,
        *,
        model: Any,
        join_on: Any,
        fill_result: bool = ...,
        join_type: str = ...,
    ) -> None: ...

class CRUDPlus(Generic[ModelT]):
    model: type[ModelT]
    def __init__(self, model: type[ModelT]) -> None: ...

    async def select_model(self, session: AsyncSession, pk: Any, **kwargs: Any) -> Any: ...
    async def select_model_by_column(self, session: AsyncSession, *whereclause: Any, **kwargs: Any) -> Any: ...
    async def select_models(self, session: AsyncSession, *whereclause: Any, **kwargs: Any) -> Any: ...
    async def select_models_order(
        self,
        session: AsyncSession,
        sort_columns: Any,
        sort_orders: Any = ...,
        *whereclause: Any,
        **kwargs: Any,
    ) -> Any: ...
    async def select_order(
        self,
        sort_columns: Any,
        sort_orders: Any = ...,
        *whereclause: Any,
        **kwargs: Any,
    ) -> Select[Any]: ...
    async def create_model(
        self,
        session: AsyncSession,
        obj: object,
        flush: bool = ...,
        commit: bool = ...,
        **kwargs: Any,
    ) -> ModelT: ...
    async def create_models(
        self,
        session: AsyncSession,
        objs: Sequence[object],
        flush: bool = ...,
        commit: bool = ...,
        **kwargs: Any,
    ) -> list[ModelT]: ...
    async def update_model(
        self,
        session: AsyncSession,
        pk: Any,
        obj: object | dict[str, Any],
        flush: bool = ...,
        commit: bool = ...,
        **kwargs: Any,
    ) -> int: ...
    async def update_model_by_column(
        self,
        session: AsyncSession,
        obj: object | dict[str, Any],
        flush: bool = ...,
        commit: bool = ...,
        **kwargs: Any,
    ) -> int: ...
    async def bulk_update_models(
        self,
        session: AsyncSession,
        records: Sequence[object | dict[str, Any]],
        flush: bool = ...,
        commit: bool = ...,
        **kwargs: Any,
    ) -> int: ...
    async def delete_model(
        self,
        session: AsyncSession,
        pk: Any,
        logical_deletion: bool = ...,
        **kwargs: Any,
    ) -> int: ...
    async def delete_model_by_column(
        self,
        session: AsyncSession,
        *whereclause: Any,
        allow_multiple: bool = ...,
        logical_deletion: bool = ...,
        flush: bool = ...,
        commit: bool = ...,
        **kwargs: Any,
    ) -> int: ...
