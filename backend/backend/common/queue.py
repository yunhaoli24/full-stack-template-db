"""Queue."""

import asyncio
import contextlib
from typing import Any
from asyncio import Queue


async def batch_dequeue(queue: Queue[Any], max_items: int, timeout: float) -> list[Any]:  # noqa: ASYNC109
    """从异步队列中获取多个项目.

    :param queue: 用于获取项目的 `asyncio.Queue` 队列
    :param max_items: 从队列中获取的最大项目数量
    :param timeout: 总的等待超时时间（秒）
    :return:
    """
    items: list[Any] = []

    async def collector() -> None:
        while len(items) < max_items:
            item = await queue.get()
            items.append(item)

    with contextlib.suppress(TimeoutError):
        await asyncio.wait_for(collector(), timeout=timeout)

    return items
