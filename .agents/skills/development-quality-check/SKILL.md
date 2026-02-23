---
name: development-quality-check
description: Check and improve code quality to ensure compliance with development standards. Use when validating new code, conducting code reviews, refactoring, fixing quality issues, or performing comprehensive quality improvements.
---

# 开发质量检查 Skill

专门用于检查和提升代码质量的 Skill，确保代码符合 `docs/工程化/代码开发规范.md` 中的标准。

## 何时使用

当需要：
- 检查新代码是否符合开发规范
- 进行代码审查或重构
- 修复代码质量问题
- 进行全面的质量改进

## 必须遵守的项目约束

- 后端测试只允许 API 级别黑盒测试，禁止编写组件级测试。
- 后端测试命令必须带 10 分钟超时：`timeout 600 bash backend/scripts/shell/test.sh`。
- 涉及坐标计算时优先 2D 坐标；仅在 2D 无法满足需求时使用 3D。
- Python 相关检查命令统一通过 `uv` 执行：优先使用已封装 `uv` 的脚本（如 `backend/scripts/shell/lint.sh`、`backend/scripts/shell/test.sh`），避免直接调用系统 Python 工具。

## 文档精简边界（提交前必查）

- 文档默认写“结论/边界/入口/流程”，不写大段实现细节和代码展开。
- 修改文档时优先更新现有文档，不新增碎片化文档。

## 检查流程

### 1. 阅读开发规范
首先阅读 `docs/工程化/代码开发规范.md` 了解所有要求：
- 优先使用现有类型
- 禁止使用硬编码字典
- 代码复用原则

### 2. 使用现有类型系统

检查是否从 `base/types.py` 导入类型：
- FloatArray
- IntArray
- FloatArray1D
- IntArray1D
- Float32Array
- BoolArray
- Pose2DSequence
- WholeBodyPose2DSequence
- ImageArray
- MaskArray
- PlanarTrack
- PlanarTracks

禁止在模块中重新定义这些类型。

### 3. 检查常量使用

检查以下文件中是否已定义需要的常量：
- `base/constants.py` - 通用常量（数学常量、阈值、窗口大小、关键点索引）
- `running/constants.py` - 跑步相关参数
- `obstacle/constants.py` - 越障相关参数
- `jumping/constants.py` - 跳跃相关参数

如果常量不存在，应添加到对应的 constants.py 文件，而不是使用魔法数字。

### 4. Pydantic BaseModel 替换字典

检查是否有函数参数使用 `dict` 作为类型提示：
- 如果用于配置参数，应创建 Pydantic BaseModel
- 如果用于动态模板参数，dict[str, str] 是可接受的

示例：
```python
# 不好的做法
def analyze(data: dict[str, Any], params: dict[str, Any]) -> dict[str, Any]:
    pass

# 好的做法
class AnalyzeParams(BaseModel):
    threshold: float
    window_size: int = 11
    enable_smoothing: bool = True

def analyze(data: FloatArray, params: AnalyzeParams) -> dict[str, Any]:
    pass
```

### 5. 代码复用检查

检查是否有重复的逻辑或工具函数：
- 搜索相似的代码模式
- 查看是否可以提取到公共模块
- 优先使用已有的工具函数

### 6. 异常处理规范

检查异常处理：
- 避免使用裸 `except Exception:`
- 使用具体的异常类型（如 `YAMLError`, `ValidationError`, `IOError`, `OSError`, `TypeError`）
- 在日志中包含异常详情

### 7. 运行质量检查工具

执行以下命令确保代码质量：
```bash
# 后端 lint（包含 ruff/mypy/pyright）
# 注意：该脚本会执行 ruff --fix 和 ruff format，可能直接修改代码
# 说明：脚本内部通过 uv 运行工具链
bash backend/scripts/shell/lint.sh

# 后端测试（API 黑盒，10 分钟超时）
# 说明：脚本内部通过 uv 运行 pytest/ray
timeout 600 bash backend/scripts/shell/test.sh
```

## 常见问题模式

### 模式 1: 重复类型定义
❌ 不好的做法：
```python
from numpy import typing as npt

FloatArray = npt.NDArray[np.float64]
BoolArray = npt.NDArray[np.bool_]
```

✅ 好的做法：
```python
from app.components.motion_analysis.base.types import FloatArray, BoolArray
```

### 模式 2: 魔法数字
❌ 不好的做法：
```python
if len(landmarks) < 5:
    pass

smooth_window = 11
```

✅ 好的做法：
```python
from app.components.motion_analysis.jumping.constants import MIN_FRAMES_FOR_STABILITY, DEFAULT_SMOOTH_WINDOW

if len(landmarks) < MIN_FRAMES_FOR_STABILITY:
    pass

smooth_window = DEFAULT_SMOOTH_WINDOW
```

### 模式 3: 硬编码字典参数
❌ 不好的做法：
```python
def analyze_video(video_path: str, params: dict[str, Any]) -> dict[str, Any]:
    threshold = params.get('threshold', 0.5)
```

✅ 好的做法：
```python
class AnalyzeVideoParams(BaseModel):
    threshold: float = 0.5
    enable_tracking: bool = True

def analyze_video(video_path: str, params: AnalyzeVideoParams) -> dict[str, Any]:
    threshold = params.threshold
```

### 模式 4: 宽泛的异常捕获
❌ 不好的做法：
```python
try:
    load_yaml_config(config_path)
except Exception as e:
    logger.error(f"Failed to load config")
```

✅ 好的做法：
```python
try:
    load_yaml_config(config_path)
except (YAMLError, IOError, OSError) as e:
    logger.error(f"Failed to load config: {e}")
```

## 检查清单

在完成代码修改后，确认：
- [ ] 使用了 `base/types.py` 中的现有类型
- [ ] 魔法数字已替换为 constants.py 中的常量
- [ ] 字典参数已替换为 Pydantic BaseModel
- [ ] 使用了具体的异常类型
- [ ] 没有重复的类型定义
- [ ] 代码遵循复用原则
- [ ] 涉及坐标计算时遵循“优先 2D，必要时 3D”
- [ ] Python 相关命令通过 `uv` 或已封装 `uv` 的脚本执行
- [ ] 通过 `bash backend/scripts/shell/lint.sh` 质量检查
- [ ] 仅新增/修改 API 级别黑盒测试
- [ ] 通过 `timeout 600 bash backend/scripts/shell/test.sh`
- [ ] 文档遵循精简边界

## 工作流程

1. **识别检查范围**：确定需要检查的文件或模块
2. **阅读规范**：参考 `docs/工程化/代码开发规范.md`
3. **逐项检查**：
   - 类型使用
   - 常量使用
   - 参数设计
   - 异常处理
   - 代码复用
4. **修复问题**：按照规范修改代码
5. **验证修复**：先运行 `bash backend/scripts/shell/lint.sh`，再运行 `timeout 600 bash backend/scripts/shell/test.sh`
6. **提交更改**：创建分支 -> 修复代码 -> 运行检查 -> 提交 PR

## 相关文档

- `docs/工程化/代码开发规范.md` - 完整的开发规范
- `docs/工程化/CI排障经验.md` - CI 相关问题排查经验
- `backend/app/components/motion_analysis/base/types.py` - 类型定义
- `backend/app/components/motion_analysis/base/constants.py` - 通用常量
