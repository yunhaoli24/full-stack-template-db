export interface CurrentUser {
  id: number;
  username: string;
  nickname: string;
  avatar: string | null;
  email: string | null;
  phone: string | null;
  dept?: string | null;
  roles?: string[];
}

export interface UserDetail {
  id: number;
  uuid: string;
  dept_id: number | null;
  username: string;
  nickname: string;
  avatar: string | null;
  email: string | null;
  phone: string | null;
  status: number;
  is_superuser: boolean;
  is_staff: boolean;
  is_multi_login: boolean;
  join_time: string;
  last_login_time: string | null;
  dept?: {
    id: number;
    name: string;
  } | null;
  roles?: Array<{
    id: number;
    name: string;
  }>;
}

export interface UserParams {
  dept?: number;
  username?: string;
  phone?: string;
  status?: number;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  nickname?: string;
  email?: string;
  phone?: string;
  dept_id: number;
  roles: number[];
}

export interface UpdateUserPayload {
  dept_id?: number | null;
  username: string;
  nickname: string;
  avatar?: string | null;
  email?: string | null;
  phone?: string | null;
  roles: number[];
}

export interface UpdateEmailPayload {
  email: string;
  captcha: string;
}

export interface ResetPasswordPayload {
  password: string;
}
