export interface ServerCpuInfo {
  usage: number;
  logical_num: number;
  physical_num: number;
  max_freq: number;
  min_freq: number;
  current_freq: number;
}

export interface ServerMemInfo {
  total: number;
  used: number;
  free: number;
  usage: number;
}

export interface ServerSysInfo {
  name: string;
  ip: string;
  os: string;
  arch: string;
}

export interface ServerDiskInfo {
  dir: string;
  type: string;
  device: string;
  total: string;
  free: string;
  used: string;
  usage: string;
}

export interface ServerServiceInfo {
  name: string;
  version: string;
  home: string;
  cpu_usage: string;
  mem_vms: string;
  mem_rss: string;
  mem_free: string;
  startup: string;
  elapsed: string;
}

export interface ServerMonitorData {
  cpu: ServerCpuInfo;
  mem: ServerMemInfo;
  sys: ServerSysInfo;
  disk: ServerDiskInfo[];
  service: ServerServiceInfo;
}
