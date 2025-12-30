
insert into sys_data_rule (id, name, model, "column", operator, expression, value, created_time, updated_time)
values
(1, '部门名称等于测试', 'Dept', 'name', 1, 0, '测试', now(), NULL),
(2, '父部门 ID 等于 1', 'Dept', 'parent_id', 0, 0, '1', now(), NULL);

insert into sys_data_scope (id, name, status, created_time, updated_time)
values
(1, '测试部门数据权限', 1, now(), NULL),
(2, '测试部门及以下数据权限', 1, now(), NULL);

insert into sys_data_scope_rule (id, data_scope_id, data_rule_id)
values
(1, 1, 1),
(2, 2, 1),
(3, 2, 2);

insert into sys_dept (id, name, sort, leader, phone, email, status, del_flag, parent_id, created_time, updated_time)
values
(1, '测试', 0, NULL, NULL, NULL, 1, false, NULL, now(), NULL);



insert into sys_menu (id, title, name, path, sort, icon, type, component, perms, status, display, cache, link, remark, parent_id, created_time, updated_time)
values
(6, '新增', 'AddSysDept', NULL, 0, NULL, 2, NULL, 'sys:dept:add', 1, 0, 1, '', NULL, 5, now(), NULL),
(7, '修改', 'EditSysDept', NULL, 0, NULL, 2, NULL, 'sys:dept:edit', 1, 0, 1, '', NULL, 5, now(), NULL),
(8, '删除', 'DeleteSysDept', NULL, 0, NULL, 2, NULL, 'sys:dept:del', 1, 0, 1, '', NULL, 5, now(), NULL),
(10, '删除', 'DeleteSysUser', NULL, 0, NULL, 2, NULL, 'sys:user:del', 1, 0, 1, '', NULL, 9, now(), NULL),
(12, '新增', 'AddSysRole', NULL, 0, NULL, 2, NULL, 'sys:role:add', 1, 0, 1, '', NULL, 11, now(), NULL),
(13, '修改', 'EditSysRole', NULL, 0, NULL, 2, NULL, 'sys:role:edit', 1, 0, 1, '', NULL, 11, now(), NULL),
(14, '修改角色菜单', 'EditSysRoleMenu', NULL, 0, NULL, 2, NULL, 'sys:role:menu:edit', 1, 0, 1, '', NULL, 11, now(), NULL),
(15, '修改角色数据范围', 'EditSysRoleScope', NULL, 0, NULL, 2, NULL, 'sys:role:scope:edit', 1, 0, 1, '', NULL, 11, now(), NULL),
(16, '删除', 'DeleteSysRole', NULL, 0, NULL, 2, NULL, 'sys:role:del', 1, 0, 1, '', NULL, 11, now(), NULL),
(18, '新增', 'AddSysMenu', NULL, 0, NULL, 2, NULL, 'sys:menu:add', 1, 0, 1, '', NULL, 17, now(), NULL),
(19, '修改', 'EditSysMenu', NULL, 0, NULL, 2, NULL, 'sys:menu:edit', 1, 0, 1, '', NULL, 17, now(), NULL),
(20, '删除', 'DeleteSysMenu', NULL, 0, NULL, 2, NULL, 'sys:menu:del', 1, 0, 1, '', NULL, 17, now(), NULL),
(23, '新增', 'AddSysDataScope', NULL, 0, NULL, 2, NULL, 'data:scope:add', 1, 0, 1, '', NULL, 22, now(), NULL),
(24, '修改', 'EditSysDataScope', NULL, 0, NULL, 2, NULL, 'data:scope:edit', 1, 0, 1, '', NULL, 22, now(), NULL),
(25, '修改数据范围规则', 'EditDataScopeRule', NULL, 0, NULL, 2, NULL, 'data:scope:rule:edit', 1, 0, 1, '', NULL, 22, now(), NULL),
(26, '删除', 'DeleteSysDataScope', NULL, 0, NULL, 2, NULL, 'data:scope:del', 1, 0, 1, '', NULL, 22, now(), NULL),
(28, '新增', 'AddSysDataRule', NULL, 0, NULL, 2, NULL, 'data:rule:add', 1, 0, 1, '', NULL, 27, now(), NULL),
(29, '修改', 'EditSysDataRule', NULL, 0, NULL, 2, NULL, 'data:rule:edit', 1, 0, 1, '', NULL, 27, now(), NULL),
(30, '删除', 'DeleteSysDataRule', NULL, 0, NULL, 2, NULL, 'data:rule:del', 1, 0, 1, '', NULL, 27, now(), NULL),
(40, '删除', 'DeleteLoginLog', NULL, 0, NULL, 2, NULL, 'log:login:del', 1, 0, 1, '', NULL, 39, now(), NULL),
(41, '清空', 'EmptyLoginLog', NULL, 0, NULL, 2, NULL, 'log:login:clear', 1, 0, 1, '', NULL, 39, now(), NULL),
(43, '删除', 'DeleteOperaLog', NULL, 0, NULL, 2, NULL, 'log:opera:del', 1, 0, 1, '', NULL, 42, now(), NULL),
(44, '清空', 'EmptyOperaLog', NULL, 0, NULL, 2, NULL, 'log:opera:clear', 1, 0, 1, '', NULL, 42, now(), NULL),
(48, '服务器监控', 'Server', '/monitor/server', 3, 'mdi:server-outline', 1, '/monitor/server/index', NULL, 1, 1, 1, NULL, NULL, 45, now(), now()),
(22, '数据范围', 'SysDataScope', '/system/data-scope', 6, 'cuida:scope-outline', 1, '/system/data-permission/scope/index', NULL, 1, 1, 1, '', NULL, 21, now(), now()),
(27, '数据规则', 'SysDataRule', '/system/data-rule', 7, 'material-symbols:rule', 1, '/system/data-permission/rule/index', NULL, 1, 1, 1, '', NULL, 21, now(), now()),
(38, '系统日志', 'Log', '/log', 3, 'carbon:cloud-logging', 0, NULL, NULL, 1, 1, 1, NULL, NULL, NULL, now(), now()),
(53, '个人中心', 'Profile', '/profile', 6, 'ant-design:profile-outlined', 1, '/_core/profile/index', NULL, 1, 0, 1, '', NULL, NULL, now(), now()),
(39, '登录日志', 'LoginLog', '/log/login', 1, 'mdi:login', 1, '/log/login/index', NULL, 1, 1, 1, '', NULL, 38, now(), now()),
(42, '操作日志', 'OperaLog', '/log/opera', 2, 'carbon:operations-record', 1, '/log/opera/index', NULL, 1, 1, 1, '', NULL, 38, now(), now()),
(5, '部门管理', 'SysDept', '/system/dept', 1, 'mingcute:department-line', 1, '/system/dept/index', NULL, 1, 1, 1, NULL, NULL, 4, now(), now()),
(9, '用户管理', 'SysUser', '/system/user', 2, 'ant-design:user-outlined', 1, '/system/user/index', NULL, 1, 1, 1, '', NULL, 4, now(), now()),
(3, '工作台', 'Workspace', '/workspace', 1, 'carbon:workspace', 1, '/dashboard/workspace/index', NULL, 1, 1, 1, '', NULL, 1, now(), now()),
(45, '系统监控', 'Monitor', '/monitor', 4, 'mdi:monitor-eye', 0, NULL, NULL, 1, 1, 1, NULL, NULL, NULL, now(), now()),
(11, '权限管理', 'SysRole', '/system/role', 3, 'carbon:user-role', 1, '/system/role/index', NULL, 1, 1, 1, NULL, NULL, 4, now(), now()),
(17, '菜单管理', 'SysMenu', '/system/menu', 4, 'ant-design:menu-outlined', 1, '/system/menu/index', NULL, 1, 1, 1, NULL, NULL, 4, now(), now()),
(21, '数据权限', 'SysDataPermission', '/system/data-permission', 5, 'icon-park-outline:permissions', 0, NULL, NULL, 1, 1, 1, '', NULL, 4, now(), now()),
(35, '系统任务', 'Scheduler', '/scheduler', 2, 'material-symbols:automation', 0, NULL, NULL, 1, 1, 1, NULL, NULL, NULL, now(), now()),
(36, '任务管理', 'SchedulerManage', '/scheduler/manage', 1, 'ix:scheduler', 1, '/scheduler/manage/index', NULL, 1, 1, 1, NULL, NULL, 35, now(), now()),
(37, '任务记录', 'SchedulerRecord', '/scheduler/record', 2, 'ix:scheduler', 1, '/scheduler/record/index', NULL, 1, 1, 1, NULL, NULL, 35, now(), now()),
(2, '数据分析', 'Analytics', '/analytics', 0, 'lucide:area-chart', 1, '/dashboard/analytics/index', NULL, 1, 1, 1, '', NULL, 1, now(), now()),
(46, '在线用户', 'Online', '/log/online', 1, 'wpf:online', 1, '/monitor/online/index', NULL, 1, 1, 1, NULL, NULL, 45, now(), now()),
(4, '系统管理', 'System', '/system', 1, 'eos-icons:admin', 0, NULL, NULL, 1, 1, 1, NULL, NULL, NULL, now(), now()),
(47, 'Redis监控', 'Redis', '/monitor/redis', 2, 'devicon:redis', 1, '/monitor/redis/index', NULL, 1, 1, 1, NULL, NULL, 45, now(), now()),
(55, '新增', 'AddConfig', NULL, 0, NULL, 2, NULL, 'sys:config:add', 1, 0, 1, '', NULL, 54, now(), NULL),
(56, '修改', 'EditConfig', NULL, 0, NULL, 2, NULL, 'sys:config:edit', 1, 0, 1, '', NULL, 54, now(), NULL),
(57, '删除', 'DeleteConfig', NULL, 0, NULL, 2, NULL, 'sys:config:del', 1, 0, 1, '', NULL, 54, now(), NULL),
(59, '新增类型', 'AddDictType', NULL, 0, NULL, 2, NULL, 'dict:type:add', 1, 0, 1, '', NULL, 58, now(), NULL),
(60, '修改类型', 'EditDictType', NULL, 0, NULL, 2, NULL, 'dict:type:edit', 1, 0, 1, '', NULL, 58, now(), NULL),
(61, '删除类型', 'DeleteDictType', NULL, 0, NULL, 2, NULL, 'dict:type:del', 1, 0, 1, '', NULL, 58, now(), NULL),
(62, '新增数据', 'AddDictData', NULL, 0, NULL, 2, NULL, 'dict:data:add', 1, 0, 1, '', NULL, 58, now(), NULL),
(63, '修改数据', 'EditDictData', NULL, 0, NULL, 2, NULL, 'dict:data:edit', 1, 0, 1, '', NULL, 58, now(), NULL),
(64, '删除数据', 'DeleteDictData', NULL, 0, NULL, 2, NULL, 'dict:data:del', 1, 0, 1, '', NULL, 58, now(), NULL),
(66, '新增', 'AddNotice', NULL, 0, NULL, 2, NULL, 'sys:notice:add', 1, 0, 1, '', NULL, 65, now(), NULL),
(67, '修改', 'EditNotice', NULL, 0, NULL, 2, NULL, 'sys:notice:edit', 1, 0, 1, '', NULL, 65, now(), NULL),
(68, '删除', 'DeleteNotice', NULL, 0, NULL, 2, NULL, 'sys:notice:del', 1, 0, 1, '', NULL, 65, now(), NULL),
(79, '对话', 'Chat', '/ai-talk', 0, 'lucide:message-square', 1, NULL, NULL, 1, 1, 1, NULL, NULL, 1, now(), now()),
(1, '控制台', 'Dashboard', '/dashboard', 0, 'ant-design:dashboard-outlined', 0, NULL, NULL, 1, 1, 1, NULL, NULL, NULL, now(), now()),
(54, '配置管理', 'PluginConfig', '/plugins/config', 7, 'codicon:symbol-parameter', 1, '/plugins/config/views/index', NULL, 1, 1, 1, '', NULL, 4, now(), now()),
(58, '字典管理', 'PluginDict', '/plugins/dict', 8, 'fluent-mdl2:dictionary', 1, '/plugins/dict/views/index', NULL, 1, 1, 1, '', NULL, 4, now(), now()),
(65, '通知管理', 'PluginNotice', '/plugins/notice', 9, 'fe:notice-push', 1, '/plugins/notice/views/index', NULL, 1, 1, 1, '', NULL, 4, now(), now());

insert into sys_role (id, name, status, is_filter_scopes, remark, created_time, updated_time)
values
(1, '测试', 1, true, NULL, now(), NULL);

insert into sys_role_data_scope (id, role_id, data_scope_id)
values
(1, 1, 1),
(2, 1, 2);

insert into sys_role_menu (id, role_id, menu_id)
values
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 1, 53);

insert into sys_user (id, uuid, username, nickname, password, salt, email, phone, avatar, status, is_superuser, is_staff, is_multi_login, join_time, last_login_time, last_password_changed_time, dept_id, created_time, updated_time)
values
(2, '1624bfcc-15b6-402f-a057-d2a7a879c18f', 'test', '用户66666', '$2b$12$BMiXsNQAgTx7aNc7kVgnwedXGyUxPEHRnJMFbiikbqHgVoT3y14Za', decode('24326224313224424D6958734E514167547837614E63376B56676E7765', 'hex'), 'test@example.com', NULL, NULL, 1, false, false, false, now(), now(), now(), 1, now(), NULL),
(1, 'a98c81ea-91e1-4daf-80d2-bdf48b26d360', 'admin', '用户666', '$2b$12$8y2eNucX19VjmZ3tYhBLcOsBwy9w1IjBQE4SSqwMDL5bGQVp2wqS.', decode('24326224313224387932654E7563583139566A6D5A33745968424C634F', 'hex'), 'admin@example.com', NULL, NULL, 1, true, true, true, now(), now(), now(), 1, now(), now());

insert into task_scheduler (id, name, task, args, kwargs, queue, exchange, routing_key, start_time, expire_time, expire_seconds, type, interval_every, interval_period, crontab, one_off, enabled, total_run_count, last_run_time, remark, created_time, updated_time)
values
(6, '清理登录日志', 'backend.app.task.tasks.db_log.tasks.delete_db_login_log', 'null', 'null', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, '0 0 * 15 *', false, true, 0, now(), NULL, now(), NULL),
(2, '测试同步任务', 'task_demo', 'null', 'null', NULL, NULL, NULL, NULL, NULL, NULL, 0, 30, 'seconds', '* * * * *', false, true, 3978, now(), NULL, now(), now()),
(1, 'celery.backend_cleanup', 'celery.backend_cleanup', 'null', 'null', NULL, NULL, NULL, NULL, NULL, 43200, 1, NULL, NULL, '0 4 * * *', false, true, 3, now(), NULL, now(), now()),
(5, '清理操作日志', 'backend.app.task.tasks.db_log.tasks.delete_db_opera_log', 'null', 'null', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, '0 0 6 * *', false, true, 1, now(), NULL, now(), now()),
(4, '测试传参任务', 'task_demo_params', '"[\"\u4f60\u597d\uff0c\"]"', '"{\"world\": \"\u4e16\u754c\"}"', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, '1 * * * *', false, true, 37, now(), NULL, now(), now()),
(3, '测试异步任务', 'task_demo_async', 'null', 'null', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, '1 * * * *', false, true, 37, now(), NULL, now(), now());

