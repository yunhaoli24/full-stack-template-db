"""File."""

from typing import Annotated

from fastapi import File, Depends, APIRouter, UploadFile

from backend.utils.file_ops import upload_file, upload_file_verify
from backend.common.dataclasses import UploadUrl
from backend.common.security.rbac import DependsRBAC
from backend.common.security.permission import RequestPermission
from backend.common.response.response_schema import ResponseSchemaModel, response_base


router: APIRouter = APIRouter()


@router.post(
    "/upload",
    summary="本地文件上传",
    dependencies=[
        Depends(RequestPermission("sys:file:upload")),
        DependsRBAC,
    ],
)  # pyright: ignore[reportGeneralTypeIssues]
async def upload_files(file: Annotated[UploadFile, File()]) -> ResponseSchemaModel[UploadUrl]:
    """Upload Files."""
    upload_file_verify(file)
    filename = await upload_file(file)
    return response_base.success(data={"url": f"/static/upload/{filename}"})
