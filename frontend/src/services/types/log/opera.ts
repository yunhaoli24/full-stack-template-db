export interface OperaLog {
  id: number;
  trace_id: string;
  username: string | null;
  method: string;
  title: string;
  path: string;
  ip: string;
  country: string | null;
  region: string | null;
  city: string | null;
  user_agent: string;
  os: string | null;
  browser: string | null;
  device: string | null;
  args: Record<string, unknown> | null;
  status: number;
  code: string;
  msg: string | null;
  cost_time: number;
  opera_time: string;
  created_time: string;
}

export interface OperaLogParams {
  page?: number;
  size?: number;
  username?: string;
  status?: number;
  ip?: string;
}
