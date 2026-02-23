from fastapi_limiter.depends import RateLimiter
from pyrate_limiter import Duration, Limiter, Rate


def create_rate_limiter(limit: int, *, seconds: int = 0, minutes: int = 0, hours: int = 0) -> RateLimiter:
    """
    创建 fastapi-limiter 0.2.x 的限流依赖

    :param limit: 时间窗口内允许的请求次数
    :param seconds: 秒窗口
    :param minutes: 分钟窗口
    :param hours: 小时窗口
    :return:
    """
    interval = (seconds * int(Duration.SECOND)) + (minutes * int(Duration.MINUTE)) + (hours * int(Duration.HOUR))

    if limit <= 0:
        raise ValueError('limit 必须大于 0')
    if interval <= 0:
        raise ValueError('限流窗口必须大于 0')

    return RateLimiter(limiter=Limiter(Rate(limit=limit, interval=interval)))
