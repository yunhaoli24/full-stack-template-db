export interface DeptTreeNode {
  id: number;
  name: string;
  parent_id: number | null;
  sort: number;
  leader: string | null;
  phone: string | null;
  email: string | null;
  status: number;
  del_flag: boolean;
  created_time: string;
  updated_time: string | null;
  children?: DeptTreeNode[] | null;
}

export interface DeptParams {
  name?: string;
  leader?: string;
  phone?: string;
  status?: number;
}

export interface DeptPayload {
  name: string;
  parent_id?: number | null;
  sort: number;
  leader?: string | null;
  phone?: string | null;
  email?: string | null;
  status: number;
}
