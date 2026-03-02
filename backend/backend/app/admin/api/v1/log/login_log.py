"""Login Log."""

from typing import Annotated

from fastapi import Query, Depends, APIRouter

from backend.database.db import CurrentSession, CurrentSessionTransaction
from backend.common.pagination import PageData, DependsPagination
from backend.common.security.jwt import DependsJwtAuth
from backend.common.security.rbac import DependsRBAC
from backend.app.admin.schema.login_log import GetLoginLogDetail, DeleteLoginLogParam
from backend.common.security.permission import RequestPermission
from backend.common.response.response_schema import ResponseModel, ResponseSchemaModel, response_base
from backend.app.admin.service.login_log_service import login_log_service


router: APIRouter = APIRouter()


@router.get(
    "",
    summary="分页获取登录日志",
    dependencies=[
        DependsJwtAuth,
        DependsPagination,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def get_login_logs_paginated(
    db: CurrentSession,
    username: Annotated[str | None, Query(description="用户名")] = None,
    status: Annotated[int | None, Query(description="状态")] = None,
    ip: Annotated[str | None, Query(description="IP 地址")] = None,
) -> ResponseSchemaModel[PageData[GetLoginLogDetail]]:
    """Get Login Logs Paginated."""
    page_data = await login_log_service.get_list(db=db, username=username, status=status, ip=ip)

    return response_base.success(data=page_data)


@router.delete(
    "",
    summary="批量删除登录日志",
    dependencies=[
        Depends(RequestPermission("log:login:del")),
        DependsRBAC,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def delete_login_logs(db: CurrentSessionTransaction, obj: DeleteLoginLogParam) -> ResponseModel:
    """Delete Login Logs."""
    count = await login_log_service.delete(db=db, obj=obj)
    if count > 0:
        return response_base.success()
    return response_base.fail()


@router.delete(
    "/all",
    summary="清空登录日志",
    dependencies=[
        Depends(RequestPermission("log:login:clear")),
        DependsRBAC,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def delete_all_login_logs(db: CurrentSessionTransaction) -> ResponseModel:
    """Delete All Login Logs."""
    await login_log_service.delete_all(db=db)
    return response_base.success()
