"""Role."""

from typing import Annotated

from fastapi import Path, Query, Depends, APIRouter

from backend.database.db import CurrentSession, CurrentSessionTransaction
from backend.common.pagination import PageData, DependsPagination
from backend.common.security.jwt import DependsJwtAuth
from backend.common.security.rbac import DependsRBAC
from backend.app.admin.schema.menu import GetMenuTree
from backend.app.admin.schema.role import (
    GetRoleDetail,
    CreateRoleParam,
    DeleteRoleParam,
    UpdateRoleParam,
    UpdateRoleMenuParam,
    UpdateRoleScopeParam,
    GetRoleWithRelationDetail,
)
from backend.common.security.permission import RequestPermission
from backend.app.admin.service.role_service import role_service
from backend.common.response.response_schema import ResponseModel, ResponseSchemaModel, response_base


router = APIRouter()


@router.get("/all", summary="获取所有角色", dependencies=[DependsJwtAuth])  # pyright: ignore[reportGeneralTypeIssues]
async def get_all_roles(db: CurrentSession) -> ResponseSchemaModel[list[GetRoleDetail]]:
    """Get All Roles."""
    data = await role_service.get_all(db=db)
    return response_base.success(data=data)


@router.get("/{pk}/menus", summary="获取角色菜单树", dependencies=[DependsJwtAuth])  # pyright: ignore[reportGeneralTypeIssues]
async def get_role_menu_tree(
    db: CurrentSession,
    pk: Annotated[int, Path(description="角色 ID")],
) -> ResponseSchemaModel[list[GetMenuTree] | None]:
    """Get Role Menu Tree."""
    menu = await role_service.get_menu_tree(db=db, pk=pk)
    return response_base.success(data=menu)


@router.get("/{pk}/scopes", summary="获取角色所有数据范围", dependencies=[DependsJwtAuth])  # pyright: ignore[reportGeneralTypeIssues]
async def get_role_scopes(
    db: CurrentSession, pk: Annotated[int, Path(description="角色 ID")]
) -> ResponseSchemaModel[list[int]]:
    """Get Role Scopes."""
    rule = await role_service.get_scopes(db=db, pk=pk)
    return response_base.success(data=rule)


@router.get("/{pk}", summary="获取角色详情", dependencies=[DependsJwtAuth])  # pyright: ignore[reportGeneralTypeIssues]
async def get_role(
    db: CurrentSession, pk: Annotated[int, Path(description="角色 ID")]
) -> ResponseSchemaModel[GetRoleWithRelationDetail]:
    """Get Role."""
    data = await role_service.get(db=db, pk=pk)
    return response_base.success(data=data)


@router.get(
    "",
    summary="分页获取所有角色",
    dependencies=[
        DependsJwtAuth,
        DependsPagination,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def get_roles_paginated(
    db: CurrentSession,
    name: Annotated[str | None, Query(description="角色名称")] = None,
    status: Annotated[int | None, Query(description="状态")] = None,
) -> ResponseSchemaModel[PageData[GetRoleDetail]]:
    """Get Roles Paginated."""
    page_data = await role_service.get_list(db=db, name=name, status=status)
    return response_base.success(data=page_data)


@router.post(
    "",
    summary="创建角色",
    dependencies=[
        Depends(RequestPermission("sys:role:add")),
        DependsRBAC,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def create_role(db: CurrentSessionTransaction, obj: CreateRoleParam) -> ResponseModel:
    """Create Role."""
    await role_service.create(db=db, obj=obj)
    return response_base.success()


@router.put(
    "/{pk}",
    summary="更新角色",
    dependencies=[
        Depends(RequestPermission("sys:role:edit")),
        DependsRBAC,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def update_role(
    db: CurrentSessionTransaction, pk: Annotated[int, Path(description="角色 ID")], obj: UpdateRoleParam
) -> ResponseModel:
    """Update Role."""
    count = await role_service.update(db=db, pk=pk, obj=obj)
    if count > 0:
        return response_base.success()
    return response_base.fail()


@router.put(
    "/{pk}/menus",
    summary="更新角色菜单",
    dependencies=[
        Depends(RequestPermission("sys:role:menu:edit")),
        DependsRBAC,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def update_role_menus(
    db: CurrentSessionTransaction,
    pk: Annotated[int, Path(description="角色 ID")],
    menu_ids: UpdateRoleMenuParam,
) -> ResponseModel:
    """Update Role Menus."""
    count = await role_service.update_role_menu(db=db, pk=pk, menu_ids=menu_ids)
    if count > 0:
        return response_base.success()
    return response_base.fail()


@router.put(
    "/{pk}/scopes",
    summary="更新角色数据范围",
    dependencies=[
        Depends(RequestPermission("sys:role:scope:edit")),
        DependsRBAC,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def update_role_scopes(
    db: CurrentSessionTransaction,
    pk: Annotated[int, Path(description="角色 ID")],
    scope_ids: UpdateRoleScopeParam,
) -> ResponseModel:
    """Update Role Scopes."""
    count = await role_service.update_role_scope(db=db, pk=pk, scope_ids=scope_ids)
    if count > 0:
        return response_base.success()
    return response_base.fail()


@router.delete(
    "",
    summary="批量删除角色",
    dependencies=[
        Depends(RequestPermission("sys:role:del")),
        DependsRBAC,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def delete_roles(db: CurrentSessionTransaction, obj: DeleteRoleParam) -> ResponseModel:
    """Delete Roles."""
    count = await role_service.delete(db=db, obj=obj)
    if count > 0:
        return response_base.success()
    return response_base.fail()
