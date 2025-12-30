insert into sys_config (id, name, type, key, value, is_frontend, remark, created_time, updated_time)
values
(1, '状态', 'EMAIL', 'EMAIL_STATUS', '1', false, NULL, now(), NULL),
(2, '服务器地址', 'EMAIL', 'EMAIL_HOST', 'smtp.qq.com', false, NULL, now(), NULL),
(3, '服务器端口', 'EMAIL', 'EMAIL_PORT', '465', false, NULL, now(), NULL),
(4, '邮箱账号', 'EMAIL', 'EMAIL_USERNAME', 'fba@qq.com', false, NULL, now(), NULL),
(5, '邮箱密码', 'EMAIL', 'EMAIL_PASSWORD', '', false, NULL, now(), NULL),
(6, 'SSL 加密', 'EMAIL', 'EMAIL_SSL', 'true', false, NULL, now(), NULL),
(7, '状态', 'USER_SECURITY', 'USER_SECURITY_CONFIG_STATUS', '1', false, NULL, now(), NULL),
(8, '密码错误锁定阈值', 'USER_SECURITY', 'USER_LOCK_THRESHOLD', '5', false, '0 表示禁用锁定', now(), NULL),
(9, '密码错误锁定时长（秒）', 'USER_SECURITY', 'USER_LOCK_SECONDS', '300', false, NULL, now(), NULL),
(10, '密码有效期（天）', 'USER_SECURITY', 'USER_PASSWORD_EXPIRY_DAYS', '365', false, '0 表示永不过期', now(), NULL),
(11, '密码到期提醒（天）', 'USER_SECURITY', 'USER_PASSWORD_REMINDER_DAYS', '7', false, '0 表示不提醒', now(), NULL),
(12, '密码历史检查次数', 'USER_SECURITY', 'USER_PASSWORD_HISTORY_CHECK_COUNT', '3', false, NULL, now(), NULL),
(13, '密码最小长度', 'USER_SECURITY', 'USER_PASSWORD_MIN_LENGTH', '6', false, NULL, now(), NULL),
(14, '密码最大长度', 'USER_SECURITY', 'USER_PASSWORD_MAX_LENGTH', '32', false, NULL, now(), NULL),
(15, '密码必须包含特殊字符', 'USER_SECURITY', 'USER_PASSWORD_REQUIRE_SPECIAL_CHAR', 'false', false, NULL, now(), NULL),
(16, '状态', 'LOGIN', 'LOGIN_CONFIG_STATUS', '1', false, NULL, now(), NULL),
(17, '验证码开关', 'LOGIN', 'LOGIN_CAPTCHA_ENABLED', 'false', false, NULL, now(), now());

select setval(pg_get_serial_sequence('sys_config', 'id'),coalesce(max(id), 0) + 1, true) from sys_config;
