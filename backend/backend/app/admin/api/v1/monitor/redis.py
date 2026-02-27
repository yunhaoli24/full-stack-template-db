from typing import TypedDict

from fastapi import APIRouter

from backend.common.response.response_schema import ResponseModel, response_base
from backend.common.security.jwt import DependsJwtAuth
from backend.utils.redis_info import redis_info

router = APIRouter()


class RedisMonitorData(TypedDict):
    info: dict[str, str]
    stats: list[dict[str, str]]


@router.get('', summary='redis 监控', dependencies=[DependsJwtAuth])  # pyright: ignore
async def get_redis_info() -> ResponseModel:
    info: dict[str, str] = await redis_info.get_info()
    stats: list[dict[str, str]] = await redis_info.get_stats()
    data: RedisMonitorData = {'info': info, 'stats': stats}
    return response_base.success(data=data)
