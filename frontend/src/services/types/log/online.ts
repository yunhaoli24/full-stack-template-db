export interface OnlineUserDetail {
  id: number;
  session_uuid: string;
  username: string;
  nickname: string;
  ip: string;
  os: string;
  browser: string;
  device: string;
  status: number;
  last_login_time: string;
  expire_time: string;
}

export interface OnlineUserParams {
  username?: string;
}
