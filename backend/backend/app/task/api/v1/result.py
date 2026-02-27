from typing import Annotated

from fastapi import Path, Query, Depends, APIRouter

from backend.database.db import CurrentSession, CurrentSessionTransaction
from backend.common.pagination import PageData, DependsPagination
from backend.common.security.jwt import DependsJwtAuth
from backend.common.security.rbac import DependsRBAC
from backend.app.task.schema.result import GetTaskResultDetail, DeleteTaskResultParam
from backend.common.security.permission import RequestPermission
from backend.app.task.service.result_service import task_result_service
from backend.common.response.response_schema import ResponseModel, ResponseSchemaModel, response_base


router = APIRouter()


@router.get("/{pk}", summary="获取任务结果详情", dependencies=[DependsJwtAuth])  # pyright: ignore
async def get_task_result(
    db: CurrentSession,
    pk: Annotated[int, Path(description="任务结果 ID")],
) -> ResponseSchemaModel[GetTaskResultDetail]:
    result = await task_result_service.get(db=db, pk=pk)
    return response_base.success(data=result)


@router.get(
    "",
    summary="分页获取所有任务结果",
    dependencies=[
        DependsJwtAuth,
        DependsPagination,
    ],
)  # pyright: ignore
async def get_task_results_paginated(
    db: CurrentSession,
    name: Annotated[str | None, Query(description="任务名称")] = None,
    task_id: Annotated[str | None, Query(description="任务 ID")] = None,
) -> ResponseSchemaModel[PageData[GetTaskResultDetail]]:
    page_data = await task_result_service.get_list(db=db, name=name, task_id=task_id)
    return response_base.success(data=page_data)


@router.delete(
    "",
    summary="批量删除任务结果",
    dependencies=[
        Depends(RequestPermission("sys:task:del")),
        DependsRBAC,
    ],
)  # pyright: ignore
async def delete_task_result(db: CurrentSessionTransaction, obj: DeleteTaskResultParam) -> ResponseModel:
    count = await task_result_service.delete(db=db, obj=obj)
    if count > 0:
        return response_base.success()
    return response_base.fail()
