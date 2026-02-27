import re
from typing import Any
from collections.abc import Mapping

from fastapi import Response
from starlette.requests import HTTPConnection
from fastapi.security.utils import get_authorization_scheme_param
from starlette.authentication import BaseUser, AuthCredentials, AuthenticationError, AuthenticationBackend

from backend.core.conf import settings
from backend.common.log import log
from backend.utils.serializers import MsgSpecJSONResponse
from backend.common.security.jwt import jwt_authentication
from backend.app.admin.schema.user import GetUserInfoWithRelationDetail
from backend.common.exception.errors import TokenError


class _AuthenticationError(AuthenticationError):
    """重写内部认证错误类."""

    def __init__(
        self,
        *,
        code: int = 500,
        msg: str = "Internal Server Error",
        headers: Mapping[str, str] | None = None,
    ) -> None:
        """初始化认证错误.

        :param code: 错误码
        :param msg: 错误信息
        :param headers: 响应头
        :return:
        """
        self.code = code
        self.msg = msg
        self.headers = headers


class JwtAuthUser(BaseUser):
    """Starlette 兼容用户对象，透传业务用户属性。."""

    def __init__(self, user: GetUserInfoWithRelationDetail) -> None:
        self._user = user

    @property
    def is_authenticated(self) -> bool:
        return True

    @property
    def display_name(self) -> str:
        return self._user.username

    @property
    def identity(self) -> str:
        return str(self._user.id)

    def __getattr__(self, name: str) -> Any:
        return getattr(self._user, name)


class JwtAuthMiddleware(AuthenticationBackend):
    """JWT 认证中间件."""

    @staticmethod
    def auth_exception_handler(conn: HTTPConnection, exc: AuthenticationError) -> Response:
        """覆盖内部认证错误处理.

        :param conn: HTTP 连接对象
        :param exc: 认证错误对象
        :return:
        """
        auth_exc = exc if isinstance(exc, _AuthenticationError) else _AuthenticationError(code=401, msg=str(exc))
        return MsgSpecJSONResponse(
            content={"code": auth_exc.code, "msg": auth_exc.msg, "data": None},
            status_code=auth_exc.code,
            headers=dict(auth_exc.headers) if auth_exc.headers else None,
        )

    async def authenticate(self, conn: HTTPConnection) -> tuple[AuthCredentials, BaseUser] | None:
        """认证请求.

        :param conn: HTTP 连接对象
        :return:
        """
        token = conn.headers.get("Authorization")
        if not token:
            return None

        path = conn.url.path
        if path in settings.TOKEN_REQUEST_PATH_EXCLUDE:
            return None
        for pattern in settings.TOKEN_REQUEST_PATH_EXCLUDE_PATTERN:
            if re.match(pattern, path):
                return None

        scheme, token = get_authorization_scheme_param(token)
        if scheme.lower() != "bearer":
            return None

        try:
            user = await jwt_authentication(token)
        except TokenError as exc:
            raise _AuthenticationError(code=exc.code, msg=exc.detail, headers=exc.headers)
        except Exception as e:
            log.exception(f"JWT 授权异常：{e}")
            raise _AuthenticationError(code=getattr(e, "code", 500), msg=getattr(e, "msg", "Internal Server Error"))

        # 请注意，此返回使用非标准模式，所以在认证通过时，将丢失某些标准特性
        # 标准返回模式请查看：https://www.starlette.io/authentication/
        return AuthCredentials(["authenticated"]), JwtAuthUser(user)
