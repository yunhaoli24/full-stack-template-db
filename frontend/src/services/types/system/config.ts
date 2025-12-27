export interface SystemConfig {
  id: number;
  name: string;
  type: string | null;
  key: string;
  value: string;
  is_frontend: boolean;
  remark: string | null;
  created_time: string;
  updated_time: string | null;
}

export interface SystemConfigPayload {
  name: string;
  type?: string | null;
  key: string;
  value: string;
  is_frontend: boolean;
  remark?: string | null;
}

export interface SystemConfigListParams {
  page: number;
  size: number;
  name?: string;
  type?: string;
}

export interface SystemConfigUpdatePayload {
  id: number;
  payload: SystemConfigPayload;
}
