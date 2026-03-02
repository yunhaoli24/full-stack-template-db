from typing import Any, TypeVar
from collections.abc import Sequence

from sqlalchemy import Select
from sqlalchemy.ext.asyncio import AsyncSession

ModelT = TypeVar("ModelT")  # noqa: PYI001

class JoinConfig:
    model: Any
    join_on: Any
    fill_result: bool
    join_type: str

    def __init__(
        self,
        *,
        model: Any,  # noqa: ANN401
        join_on: Any,  # noqa: ANN401
        fill_result: bool = ...,
        join_type: str = ...,
    ) -> None: ...

class CRUDPlus[ModelT]:
    model: type[ModelT]
    def __init__(self, model: type[ModelT]) -> None: ...
    async def select_model(self, session: AsyncSession, pk: Any, **kwargs: Any) -> Any: ...  # noqa: ANN401
    async def select_model_by_column(self, session: AsyncSession, *whereclause: Any, **kwargs: Any) -> Any: ...  # noqa: ANN401
    async def select_models(self, session: AsyncSession, *whereclause: Any, **kwargs: Any) -> Any: ...  # noqa: ANN401
    async def select_models_order(
        self,
        session: AsyncSession,
        sort_columns: Any,  # noqa: ANN401
        sort_orders: Any = ...,  # noqa: ANN401
        *whereclause: Any,  # noqa: ANN401
        **kwargs: Any,  # noqa: ANN401
    ) -> Any: ...  # noqa: ANN401
    async def select_order(
        self,
        sort_columns: Any,  # noqa: ANN401
        sort_orders: Any = ...,  # noqa: ANN401
        *whereclause: Any,  # noqa: ANN401
        **kwargs: Any,  # noqa: ANN401
    ) -> Select[Any]: ...
    async def create_model(
        self,
        session: AsyncSession,
        obj: object,
        flush: bool = ...,
        commit: bool = ...,
        **kwargs: Any,  # noqa: ANN401
    ) -> ModelT: ...
    async def create_models(
        self,
        session: AsyncSession,
        objs: Sequence[object],
        flush: bool = ...,
        commit: bool = ...,
        **kwargs: Any,  # noqa: ANN401
    ) -> list[ModelT]: ...
    async def update_model(
        self,
        session: AsyncSession,
        pk: Any,  # noqa: ANN401
        obj: object | dict[str, Any],
        flush: bool = ...,
        commit: bool = ...,
        **kwargs: Any,  # noqa: ANN401
    ) -> int: ...
    async def update_model_by_column(
        self,
        session: AsyncSession,
        obj: object | dict[str, Any],
        flush: bool = ...,
        commit: bool = ...,
        **kwargs: Any,  # noqa: ANN401
    ) -> int: ...
    async def bulk_update_models(
        self,
        session: AsyncSession,
        records: Sequence[object | dict[str, Any]],
        flush: bool = ...,
        commit: bool = ...,
        **kwargs: Any,  # noqa: ANN401
    ) -> int: ...
    async def delete_model(
        self,
        session: AsyncSession,
        pk: Any,  # noqa: ANN401
        logical_deletion: bool = ...,
        **kwargs: Any,  # noqa: ANN401
    ) -> int: ...
    async def delete_model_by_column(
        self,
        session: AsyncSession,
        *whereclause: Any,  # noqa: ANN401
        allow_multiple: bool = ...,
        logical_deletion: bool = ...,
        flush: bool = ...,
        commit: bool = ...,
        **kwargs: Any,  # noqa: ANN401
    ) -> int: ...
