# 后端运行要点

## 结论

- 后端限流统一通过 `backend/backend/common/security/limiter.py` 的 `create_rate_limiter` 创建依赖。
- 开发启动脚本 `dev.sh` 会同时拉起前端、后端 API、Celery worker、Celery beat、Celery flower。
- `dev.sh` 会自动探测后端 API 和 flower 的可用端口，避免默认端口被占用导致进程退出。

## 入口

- 启动全栈开发环境：`./dev.sh`
- 后端限流构造器位置：`backend/backend/common/security/limiter.py`

## 约束

- 新增限流规则时，不直接在业务路由里实例化 `fastapi_limiter.depends.RateLimiter`，统一走 `create_rate_limiter`。
- 修改 `dev.sh` 时保留多进程统一清理逻辑，确保任一服务退出时可以回收子进程。
