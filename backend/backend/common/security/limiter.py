"""Limiter."""

from pyrate_limiter import Rate, Limiter, Duration
from fastapi_limiter.depends import RateLimiter


def create_rate_limiter(limit: int, *, seconds: int = 0, minutes: int = 0, hours: int = 0) -> RateLimiter:
    """创建 fastapi-limiter 0.2.x 的限流依赖.

    :param limit: 时间窗口内允许的请求次数
    :param seconds: 秒窗口
    :param minutes: 分钟窗口
    :param hours: 小时窗口
    :return:
    """
    interval = (seconds * int(Duration.SECOND)) + (minutes * int(Duration.MINUTE)) + (hours * int(Duration.HOUR))

    if limit <= 0:
        msg = "limit 必须大于 0"
        raise ValueError(msg)
    if interval <= 0:
        msg = "限流窗口必须大于 0"
        raise ValueError(msg)

    return RateLimiter(limiter=Limiter(Rate(limit=limit, interval=interval)))
