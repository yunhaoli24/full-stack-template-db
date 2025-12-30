-- 更新菜单数据：补充 icon 和修正中文名称

-- 更新控制台子菜单的标题和 icon
UPDATE sys_menu SET title = '数据分析' WHERE id = 2;
UPDATE sys_menu SET title = '工作台' WHERE id = 3;

-- 为对话菜单添加 icon
UPDATE sys_menu SET icon = 'lucide:message-square' WHERE id = 79;

-- 更新系统管理子菜单的标题
UPDATE sys_menu SET title = '用户管理' WHERE id = 9;

-- 更新数据权限相关菜单标题
UPDATE sys_menu SET title = '数据权限' WHERE id = 21;
UPDATE sys_menu SET title = '数据范围' WHERE id = 22;
UPDATE sys_menu SET title = '数据规则' WHERE id = 27;

-- 更新系统任务菜单标题
UPDATE sys_menu SET title = '系统任务' WHERE id = 35;
UPDATE sys_menu SET title = '任务管理' WHERE id = 36;
UPDATE sys_menu SET title = '任务记录' WHERE id = 37;

-- 更新系统日志菜单标题
UPDATE sys_menu SET title = '系统日志' WHERE id = 38;
UPDATE sys_menu SET title = '登录日志' WHERE id = 39;
UPDATE sys_menu SET title = '操作日志' WHERE id = 42;

-- 更新系统监控菜单标题
UPDATE sys_menu SET title = '系统监控' WHERE id = 45;
UPDATE sys_menu SET title = '在线用户' WHERE id = 46;
UPDATE sys_menu SET title = 'Redis监控' WHERE id = 47;
UPDATE sys_menu SET title = '服务器监控' WHERE id = 48;

-- 更新个人中心菜单标题
UPDATE sys_menu SET title = '个人中心' WHERE id = 53;

-- 更新插件菜单标题
UPDATE sys_menu SET title = '配置管理' WHERE id = 54;
UPDATE sys_menu SET title = '字典管理' WHERE id = 58;
UPDATE sys_menu SET title = '通知管理' WHERE id = 65;

-- 更新代码生成器菜单标题和添加 icon
UPDATE sys_menu SET title = '代码生成器' WHERE id = 69;

-- 更新项目菜单的 icon（使用 iconify 图标而非图片 URL）
UPDATE sys_menu SET icon = 'ant-design:project-outlined' WHERE id = 49;

-- 确保所有按钮权限都有合适的中文标题
-- 这些通常已经是中文，但确保一下
