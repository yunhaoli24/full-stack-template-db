export interface LoginLog {
  id: number;
  user_uuid: string;
  username: string;
  status: number;
  ip: string;
  country: string | null;
  region: string | null;
  city: string | null;
  user_agent: string;
  browser: string | null;
  os: string | null;
  device: string | null;
  msg: string;
  login_time: string;
  created_time: string;
}

export interface LoginLogParams {
  username?: string;
  status?: number;
  ip?: string;
}
