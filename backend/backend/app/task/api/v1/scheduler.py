"""Scheduler."""

from typing import Annotated

from fastapi import Path, Query, Depends, APIRouter

from backend.database.db import CurrentSession, CurrentSessionTransaction
from backend.common.pagination import PageData, DependsPagination
from backend.common.security.jwt import DependsJwtAuth
from backend.common.security.rbac import DependsRBAC
from backend.app.task.schema.scheduler import (
    GetTaskSchedulerDetail,
    CreateTaskSchedulerParam,
    UpdateTaskSchedulerParam,
)
from backend.common.security.permission import RequestPermission
from backend.common.response.response_schema import ResponseModel, ResponseSchemaModel, response_base
from backend.app.task.service.scheduler_service import task_scheduler_service


router = APIRouter()


@router.get("/all", summary="获取所有任务调度", dependencies=[DependsJwtAuth])  # pyright: ignore[reportGeneralTypeIssues]
async def get_all_task_schedulers(db: CurrentSession) -> ResponseSchemaModel[list[GetTaskSchedulerDetail]]:
    """Get All Task Schedulers."""
    schedulers = await task_scheduler_service.get_all(db=db)
    return response_base.success(data=schedulers)


@router.get("/{pk}", summary="获取任务调度详情", dependencies=[DependsJwtAuth])  # pyright: ignore[reportGeneralTypeIssues]
async def get_task_scheduler(
    db: CurrentSession,
    pk: Annotated[int, Path(description="任务调度 ID")],
) -> ResponseSchemaModel[GetTaskSchedulerDetail]:
    """Get Task Scheduler."""
    task_scheduler = await task_scheduler_service.get(db=db, pk=pk)
    return response_base.success(data=task_scheduler)


@router.get(
    "",
    summary="分页获取所有任务调度",
    dependencies=[
        DependsJwtAuth,
        DependsPagination,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def get_task_scheduler_paginated(
    db: CurrentSession,
    name: Annotated[str | None, Query(description="任务调度名称")] = None,
    scheduler_type: Annotated[int | None, Query(description="任务调度类型")] = None,
) -> ResponseSchemaModel[PageData[GetTaskSchedulerDetail]]:
    """Get Task Scheduler Paginated."""
    page_data = await task_scheduler_service.get_list(db=db, name=name, scheduler_type=scheduler_type)
    return response_base.success(data=page_data)


@router.post(
    "",
    summary="创建任务调度",
    dependencies=[
        Depends(RequestPermission("sys:task:add")),
        DependsRBAC,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def create_task_scheduler(db: CurrentSessionTransaction, obj: CreateTaskSchedulerParam) -> ResponseModel:
    """Create Task Scheduler."""
    await task_scheduler_service.create(db=db, obj=obj)
    return response_base.success()


@router.put(
    "/{pk}",
    summary="更新任务调度",
    dependencies=[
        Depends(RequestPermission("sys:task:edit")),
        DependsRBAC,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def update_task_scheduler(
    db: CurrentSessionTransaction,
    pk: Annotated[int, Path(description="任务调度 ID")],
    obj: UpdateTaskSchedulerParam,
) -> ResponseModel:
    """Update Task Scheduler."""
    count = await task_scheduler_service.update(db=db, pk=pk, obj=obj)
    if count > 0:
        return response_base.success()
    return response_base.fail()


@router.put(
    "/{pk}/status",
    summary="更新任务调度状态",
    dependencies=[
        Depends(RequestPermission("sys:task:edit")),
        DependsRBAC,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def update_task_scheduler_status(
    db: CurrentSessionTransaction, pk: Annotated[int, Path(description="任务调度 ID")]
) -> ResponseModel:
    """Update Task Scheduler Status."""
    count = await task_scheduler_service.update_status(db=db, pk=pk)
    if count > 0:
        return response_base.success()
    return response_base.fail()


@router.delete(
    "/{pk}",
    summary="删除任务调度",
    dependencies=[
        Depends(RequestPermission("sys:task:del")),
        DependsRBAC,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def delete_task_scheduler(
    db: CurrentSessionTransaction, pk: Annotated[int, Path(description="任务调度 ID")]
) -> ResponseModel:
    """Delete Task Scheduler."""
    count = await task_scheduler_service.delete(db=db, pk=pk)
    if count > 0:
        return response_base.success()
    return response_base.fail()


@router.post(
    "/{pk}/execute",
    summary="执行任务",
    dependencies=[
        Depends(RequestPermission("sys:task:exec")),
        DependsRBAC,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def execute_task(db: CurrentSession, pk: Annotated[int, Path(description="任务调度 ID")]) -> ResponseModel:
    """Execute Task."""
    await task_scheduler_service.execute(db=db, pk=pk)
    return response_base.success()
