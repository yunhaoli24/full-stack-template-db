---
name: development-quality-check
description: Check and improve code quality to ensure compliance with development standards. Use when validating new code, conducting code reviews, refactoring, fixing quality issues, or performing comprehensive quality improvements.
---

# 开发质量检查 Skill

用于在当前仓库内执行可落地的代码质量检查与改进，确保改动符合现有约束与流程。

## 何时使用

- 新增功能后需要做提交前质量检查
- 代码评审发现质量问题，需要集中修复
- 重构后需要验证行为未回归
- 准备提交或发起 PR/MR 之前

## 当前仓库约束（必须遵守）

- 本地全栈联调统一入口是根目录 `./dev.sh`。
- 用户提到 lint 错误时，必须先运行后端 lint 脚本查看具体错误。
- Python 相关命令优先使用 `uv` 或已封装脚本，不直接依赖系统 Python 全局工具。
- 文档只记录当前现状（入口/约束/流程）；现状变化时同步更新 `AGENTS.md` 与 `docs/backend/` 下对应文档。
- Git 协作采用分支 + PR + Review，不直接在 `master` 上提交。

## 质量检查流程

### 1) 明确范围

- 先基于改动文件确定检查范围（后端/前端/文档）。
- 优先关注本次改动涉及的代码，不做无关大面积改写。

### 2) 执行可用检查命令

```bash
# 后端 lint（在 backend 目录执行）
cd backend && bash backend/scripts/lint.sh

# 后端测试（需要时执行，建议带 10 分钟超时）
cd backend && timeout 600 uv run pytest

# 前端 lint（前端改动时执行）
cd frontend && pnpm lint
```

说明：
- `backend/scripts/lint.sh` 实际文件路径为 `backend/backend/scripts/lint.sh`（因命令在 `backend/` 目录执行）。
- 后端 lint 脚本会触发自动修复/格式化，需要在运行后复查变更。

### 3) 代码审查重点

- 可读性：命名清晰、结构直观、控制复杂度。
- 一致性：沿用现有模块模式，不引入风格割裂实现。
- 复用性：避免重复逻辑，优先复用现有公共能力。
- 异常处理：避免无差别兜底捕获，日志包含必要上下文。
- 变更最小化：只改与目标相关内容，避免顺手重写无关区域。

### 4) 文档与流程一致性

- 若改动影响“当前现状”类信息（入口、约束、流程），同步更新：
  - `AGENTS.md`
  - `docs/backend/README.md`
  - `docs/backend/` 下受影响的主题文档

## 提交前清单

- [ ] 已按改动范围执行必要检查命令
- [ ] lint/test 报错已定位并修复
- [ ] 关键改动已做自检，无明显行为回归
- [ ] 文档与当前实现保持一致
- [ ] 满足分支协作流程（分支 + PR）

## 与其他 Skill 的配合

- 提交前质量门禁顺序：先执行 `code-simplifier`，再执行 `development-quality-check`。
