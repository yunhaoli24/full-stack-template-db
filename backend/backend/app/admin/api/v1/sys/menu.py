"""Menu."""

from typing import Any, Annotated

from fastapi import Path, Query, Depends, Request, APIRouter

from backend.database.db import CurrentSession, CurrentSessionTransaction
from backend.common.security.jwt import DependsJwtAuth
from backend.common.security.rbac import DependsRBAC
from backend.app.admin.schema.menu import GetMenuTree, GetMenuDetail, CreateMenuParam, UpdateMenuParam
from backend.common.security.permission import RequestPermission
from backend.app.admin.service.menu_service import menu_service
from backend.common.response.response_schema import ResponseModel, ResponseSchemaModel, response_base


router: APIRouter = APIRouter()


@router.get(
    "/sidebar", summary="获取用户菜单侧边栏", description="已适配 vben admin v5", dependencies=[DependsJwtAuth]
)  # pyright: ignore[reportGeneralTypeIssues]
async def get_user_sidebar(db: CurrentSession, request: Request) -> ResponseSchemaModel[list[dict[str, Any] | None]]:
    """Get User Sidebar."""
    menu = await menu_service.get_sidebar(db=db, request=request)
    return response_base.success(data=menu)


@router.get("/{pk}", summary="获取菜单详情", dependencies=[DependsJwtAuth])  # pyright: ignore[reportGeneralTypeIssues]
async def get_menu(
    db: CurrentSession, pk: Annotated[int, Path(description="菜单 ID")]
) -> ResponseSchemaModel[GetMenuDetail]:
    """Get Menu."""
    data = await menu_service.get(db=db, pk=pk)
    return response_base.success(data=data)


@router.get("", summary="获取菜单树", dependencies=[DependsJwtAuth])  # pyright: ignore[reportGeneralTypeIssues]
async def get_menu_tree(
    db: CurrentSession,
    title: Annotated[str | None, Query(description="菜单标题")] = None,
    status: Annotated[int | None, Query(description="状态")] = None,
) -> ResponseSchemaModel[list[GetMenuTree]]:
    """Get Menu Tree."""
    menu = await menu_service.get_tree(db=db, title=title, status=status)
    return response_base.success(data=menu)


@router.post(
    "",
    summary="创建菜单",
    dependencies=[
        Depends(RequestPermission("sys:menu:add")),
        DependsRBAC,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def create_menu(db: CurrentSessionTransaction, obj: CreateMenuParam) -> ResponseModel:
    """Create Menu."""
    await menu_service.create(db=db, obj=obj)
    return response_base.success()


@router.put(
    "/{pk}",
    summary="更新菜单",
    dependencies=[
        Depends(RequestPermission("sys:menu:edit")),
        DependsRBAC,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def update_menu(
    db: CurrentSessionTransaction, pk: Annotated[int, Path(description="菜单 ID")], obj: UpdateMenuParam
) -> ResponseModel:
    """Update Menu."""
    count = await menu_service.update(db=db, pk=pk, obj=obj)
    if count > 0:
        return response_base.success()
    return response_base.fail()


@router.delete(
    "/{pk}",
    summary="删除菜单",
    dependencies=[
        Depends(RequestPermission("sys:menu:del")),
        DependsRBAC,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def delete_menu(db: CurrentSessionTransaction, pk: Annotated[int, Path(description="菜单 ID")]) -> ResponseModel:
    """Delete Menu."""
    count = await menu_service.delete(db=db, pk=pk)
    if count > 0:
        return response_base.success()
    return response_base.fail()
