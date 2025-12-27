# 仓库指南

## 项目结构与模块组织
- `backend/` 是 FastAPI 服务。主包在 `backend/backend/`，包含 `app/`（API、schema、service、crud、model）、`common/`、`core/`、`middleware/`、`plugin/`，以及用于迁移的 `alembic/`。
- 后端测试位于 `backend/backend/app/admin/tests`，命名为 `test_*.py`。
- `frontend/` 是 Vue 3 + Vite 应用。核心代码在 `frontend/src/`，包含 `pages/`（自动路由视图）、`components/`、`assets/`、`stores/`、`services/` 和 `composables/`。

## 构建、测试与开发命令
后端（在 `backend/` 目录运行）：
- `uv sync` 从 `pyproject.toml` 和 `uv.lock` 安装依赖。
- `python backend/run.py` 启动带自动重载的开发服务。
- `pytest` 运行后端测试。
- `bash backend/scripts/lint.sh` 运行仓库 lint 检查（prek）。
- `bash backend/scripts/format.sh` 使用 Ruff 检查格式。
- `docker compose -f docker-compose.yml up` 启动完整后端栈（DB、Redis、RabbitMQ、server）。

前端（在 `frontend/` 目录运行）：
- `pnpm install` 安装依赖。
- `pnpm dev` 启动开发服务。
- `pnpm build` 构建生产包。
- `pnpm preview` 本地预览生产包。
- `pnpm lint` 运行 `oxlint` 和 `oxfmt`。

## 编码风格与命名规范
- Python：4 空格缩进，Ruff 格式化（行宽 120、单引号）。Ruff 规则强制类型注解。模块/函数用 `snake_case`，类用 `PascalCase`。
- 前端：TypeScript + Vue SFC，使用 `oxlint/oxfmt`。`.vue` 文件名用 `kebab-case`，composable 用 `use-*.ts`（见 `frontend/src/composables/`）。

## 功能实现约定
- 前端新增功能先对照已有相似页面实现，优先复用现有组件；表格统一复用封装组件 `frontend/src/components/data-table/data-table.vue`（如需页面级封装放在对应 `pages/.../components/`）。
- 前端 API 接口按模块放在 `frontend/src/services/api/<domain>/`；接口 types 放在 `frontend/src/services/types/<domain>/`，通用 types 放在 `frontend/src/types/`。
- 后端新增功能按 API -> schema -> service -> CRUD -> model 分层落位；API 路由在 `backend/backend/app/admin/api/v1/<domain>/`，schema/service/crud/model 分别放在 `backend/backend/app/admin/schema/`、`backend/backend/app/admin/service/`、`backend/backend/app/admin/crud/`、`backend/backend/app/admin/model/`。

## 测试指南
- 后端使用 `pytest`。在 `backend/backend/app/admin/tests` 现有套件旁新增测试，命名遵循 `test_*.py`。
- 前端 `frontend/package.json` 未配置测试运行器，只有在功能需要时才新增。

## 提交与 PR 指南
- Git 历史简短且非正式，近期提交主题如 `refactor: ...`、`update`。提交信息保持简洁明确，必要时用 `type: summary`。
- PR 需包含摘要、测试说明、关联 issue，以及 UI 变更的截图或动图。

## 配置与密钥
- 本地运行前拷贝 `.env` 模板：`backend/backend/.env.example` 和 `frontend/.env.example`。
- 避免将真实凭据与 API Key 提交到 Git 历史中。

## 架构概览
- 后端采用伪三层流程：API routes -> schema -> service -> CRUD -> model。
