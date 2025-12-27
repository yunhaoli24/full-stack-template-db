export interface RedisInfo {
  [key: string]: string;
}

export interface RedisCommandStat {
  name: string;
  value: string;
}

export interface RedisMonitorData {
  info: RedisInfo;
  stats: RedisCommandStat[];
}
