## Casbin RBAC

我们在最初架构设计时，参考了 go-admin，gin-vue-admin... 等优秀的开源项目，同时引入了 Casbin，它在众多 python web
开源项目中可能是极为罕见的，并且，它的学习成本非常高

使用此插件前，请查看以下内容

## Casbin 基础学习

建议通过以下资源系统学习 Casbin

- **官方文档**：[Casbin官网](https://casbin.org/docs/get-started)
- **视频教程**：
    - [半小时彻底弄懂Casbin基础模型](https://www.bilibili.com/video/BV1qz4y167XP)
    - [Casbin代码使用与API调用](https://www.bilibili.com/video/BV13r4y1M7AC)

## 配置

在 core/conf.py 中添加以下内容:

```python
##################################################
# [ Plugin ] Casdoor
##################################################
# 基础配置
RBAC_CASBIN_EXCLUDE: set[tuple[str, str]] = {
  ('POST', f'{settings.FASTAPI_API_V1_PATH}/auth/logout'),
  ('POST', f'{settings.FASTAPI_API_V1_PATH}/auth/token/new'),
}
```

## 规则配置

内置模型：

```text
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && (keyMatch(r.obj, p.obj) || keyMatch3(r.obj, p.obj)) && (r.act == p.act || p.act == "*")
```

建议使用 [在线编辑器](https://casbin.org/zh/docs/online-editor) 验证规则

## 策略管理

| 类型            | 适用场景   | 格式                                  | 依赖关系   |
|---------------|--------|-------------------------------------|--------|
| **P策略**（角色基准） | 批量用户配置 | `角色 role + 访问路径 path + 访问方法 method` | 需配合G策略 |
| **P策略**（用户基准） | 指定用户配置 | `用户 uuid + 访问路径 path + 访问方法 method` | 独立生效   |
| **G策略**       | 角色分配   | `用户 uuid + 角色 role`                 | 需P策略配合 |

## 策略操作接口

文件路径：`api/v1/sys/casbin.py`

## 接口集成

在路由声明中添加鉴权依赖：

```python
@router.post(
    '/hello',
    summary='示例接口',
    dependencies=[DependsRBAC]  # 关键鉴权标识
)
async def hello():
    ...
```
