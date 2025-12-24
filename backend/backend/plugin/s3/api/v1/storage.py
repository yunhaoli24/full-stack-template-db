from typing import Annotated

from fastapi import APIRouter, Depends, Path
from fastapi.params import Query

from backend.common.pagination import DependsPagination, PageData
from backend.common.response.response_schema import ResponseModel, ResponseSchemaModel, response_base
from backend.common.security.jwt import DependsJwtAuth
from backend.common.security.permission import RequestPermission
from backend.common.security.rbac import DependsRBAC
from backend.database.db import CurrentSession, CurrentSessionTransaction
from backend.plugin.s3.schema.storage import (
    CreateS3StorageParam,
    DeleteS3StorageParam,
    GetS3StorageDetail,
    UpdateS3StorageParam,
)
from backend.plugin.s3.service.storage import s3_storage_service

router = APIRouter()


@router.get('/all', summary='获取所有 S3 存储详情', dependencies=[DependsJwtAuth])
async def get_all_s3_storages(db: CurrentSession) -> ResponseSchemaModel[list[GetS3StorageDetail]]:
    s3_storage = await s3_storage_service.get_all(db=db)
    return response_base.success(data=s3_storage)


@router.get('/{pk}', summary='获取 S3 存储详情', dependencies=[DependsJwtAuth])
async def get_s3_storage(
    db: CurrentSession, pk: Annotated[int, Path(description='S3 存储 ID')]
) -> ResponseSchemaModel[GetS3StorageDetail]:
    s3_storage = await s3_storage_service.get(db=db, pk=pk)
    return response_base.success(data=s3_storage)


@router.get(
    '',
    summary='分页获取所有 S3 存储',
    dependencies=[
        DependsJwtAuth,
        DependsPagination,
    ],
)
async def get_s3_storages_paginated(
    db: CurrentSession,
    name: Annotated[str | None, Query(description='存储名称')] = None,
    region: Annotated[str | None, Query(description='区域')] = None,
) -> ResponseSchemaModel[PageData[GetS3StorageDetail]]:
    page_data = await s3_storage_service.get_list(db=db, name=name, region=region)
    return response_base.success(data=page_data)


@router.post(
    '',
    summary='创建 S3 存储',
    dependencies=[
        Depends(RequestPermission('s3:storage:add')),
        DependsRBAC,
    ],
)
async def create_s3_storage(db: CurrentSessionTransaction, obj: CreateS3StorageParam) -> ResponseModel:
    await s3_storage_service.create(db=db, obj=obj)
    return response_base.success()


@router.put(
    '/{pk}',
    summary='更新 S3 存储',
    dependencies=[
        Depends(RequestPermission('s3:storage:edit')),
        DependsRBAC,
    ],
)
async def update_s3_storage(
    db: CurrentSessionTransaction, pk: Annotated[int, Path(description='S3 存储 ID')], obj: UpdateS3StorageParam
) -> ResponseModel:
    count = await s3_storage_service.update(db=db, pk=pk, obj=obj)
    if count > 0:
        return response_base.success()
    return response_base.fail()


@router.delete(
    '',
    summary='批量删除 S3 存储',
    dependencies=[
        Depends(RequestPermission('s3:storage:del')),
        DependsRBAC,
    ],
)
async def delete_s3_storages(db: CurrentSessionTransaction, obj: DeleteS3StorageParam) -> ResponseModel:
    count = await s3_storage_service.delete(db=db, obj=obj)
    if count > 0:
        return response_base.success()
    return response_base.fail()
