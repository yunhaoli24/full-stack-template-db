export interface RoleDetail {
  id: number;
  name: string;
  status: number;
  is_filter_scopes: boolean;
  remark: string | null;
  created_time: string;
  updated_time: string | null;
}

export interface RoleParams {
  name?: string;
  status?: number;
}

export interface CreateRolePayload {
  name: string;
  status: number;
  is_filter_scopes: boolean;
  remark?: string | null;
}

export interface UpdateRolePayload {
  name: string;
  status: number;
  is_filter_scopes: boolean;
  remark?: string | null;
}

export interface UpdateRoleMenusPayload {
  menus: number[];
}

export interface UpdateRoleScopesPayload {
  scopes: number[];
}
