"""Data Scope."""

from typing import Annotated

from fastapi import Path, Query, Depends, APIRouter

from backend.database.db import CurrentSession, CurrentSessionTransaction
from backend.common.pagination import PageData, DependsPagination
from backend.common.security.jwt import DependsJwtAuth
from backend.common.security.rbac import DependsRBAC
from backend.common.security.permission import RequestPermission
from backend.app.admin.schema.data_scope import (
    GetDataScopeDetail,
    CreateDataScopeParam,
    DeleteDataScopeParam,
    UpdateDataScopeParam,
    UpdateDataScopeRuleParam,
    GetDataScopeWithRelationDetail,
)
from backend.common.response.response_schema import ResponseModel, ResponseSchemaModel, response_base
from backend.app.admin.service.data_scope_service import data_scope_service


router: APIRouter = APIRouter()


@router.get("/all", summary="获取所有数据范围", dependencies=[DependsJwtAuth])  # pyright: ignore[reportGeneralTypeIssues]
async def get_all_data_scope(db: CurrentSession) -> ResponseSchemaModel[list[GetDataScopeDetail]]:
    """Get All Data Scope."""
    data = await data_scope_service.get_all(db=db)
    return response_base.success(data=data)


@router.get("/{pk}", summary="获取数据范围详情", dependencies=[DependsJwtAuth])  # pyright: ignore[reportGeneralTypeIssues]
async def get_data_scope(
    db: CurrentSession,
    pk: Annotated[int, Path(description="数据范围 ID")],
) -> ResponseSchemaModel[GetDataScopeDetail]:
    """Get Data Scope."""
    data = await data_scope_service.get(db=db, pk=pk)
    return response_base.success(data=data)


@router.get("/{pk}/rules", summary="获取数据范围所有规则", dependencies=[DependsJwtAuth])  # pyright: ignore[reportGeneralTypeIssues]
async def get_data_scope_rules(
    db: CurrentSession,
    pk: Annotated[int, Path(description="数据范围 ID")],
) -> ResponseSchemaModel[GetDataScopeWithRelationDetail]:
    """Get Data Scope Rules."""
    data = await data_scope_service.get_rules(db=db, pk=pk)
    return response_base.success(data=data)


@router.get(
    "",
    summary="分页获取所有数据范围",
    dependencies=[
        DependsJwtAuth,
        DependsPagination,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def get_data_scopes_paginated(
    db: CurrentSession,
    name: Annotated[str | None, Query(description="范围名称")] = None,
    status: Annotated[int | None, Query(description="状态")] = None,
) -> ResponseSchemaModel[PageData[GetDataScopeDetail]]:
    """Get Data Scopes Paginated."""
    page_data = await data_scope_service.get_list(db=db, name=name, status=status)
    return response_base.success(data=page_data)


@router.post(
    "",
    summary="创建数据范围",
    dependencies=[
        Depends(RequestPermission("data:scope:add")),
        DependsRBAC,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def create_data_scope(db: CurrentSessionTransaction, obj: CreateDataScopeParam) -> ResponseModel:
    """Create Data Scope."""
    await data_scope_service.create(db=db, obj=obj)
    return response_base.success()


@router.put(
    "/{pk}",
    summary="更新数据范围",
    dependencies=[
        Depends(RequestPermission("data:scope:edit")),
        DependsRBAC,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def update_data_scope(
    db: CurrentSessionTransaction,
    pk: Annotated[int, Path(description="数据范围 ID")],
    obj: UpdateDataScopeParam,
) -> ResponseModel:
    """Update Data Scope."""
    count = await data_scope_service.update(db=db, pk=pk, obj=obj)
    if count > 0:
        return response_base.success()
    return response_base.fail()


@router.put(
    "/{pk}/rules",
    summary="更新数据范围规则",
    dependencies=[
        Depends(RequestPermission("data:scope:rule:edit")),
        DependsRBAC,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def update_data_scope_rules(
    db: CurrentSessionTransaction,
    pk: Annotated[int, Path(description="数据范围 ID")],
    rule_ids: UpdateDataScopeRuleParam,
) -> ResponseModel:
    """Update Data Scope Rules."""
    count = await data_scope_service.update_data_scope_rule(db=db, pk=pk, rule_ids=rule_ids)
    if count > 0:
        return response_base.success()
    return response_base.fail()


@router.delete(
    "",
    summary="批量删除数据范围",
    dependencies=[
        Depends(RequestPermission("data:scope:del")),
        DependsRBAC,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def delete_data_scopes(db: CurrentSessionTransaction, obj: DeleteDataScopeParam) -> ResponseModel:
    """Delete Data Scopes."""
    count = await data_scope_service.delete(db=db, obj=obj)
    if count > 0:
        return response_base.success()
    return response_base.fail()
