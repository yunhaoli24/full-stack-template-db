export interface MenuMeta {
  title: string;
  icon?: string | null;
  iframeSrc?: string | null;
  link?: string | null;
  keepAlive?: boolean;
  hideInMenu?: boolean;
  menuVisibleWithForbidden?: boolean;
}

export interface MenuTreeNode {
  id: number;
  title: string;
  name: string;
  path: string | null;
  parent_id: number | null;
  sort: number;
  icon: string | null;
  type: number;
  component: string | null;
  perms: string | null;
  status: number;
  display: number;
  cache: number;
  link: string | null;
  remark: string | null;
  created_time: string;
  updated_time: string | null;
  children?: MenuTreeNode[] | null;
}

export interface SidebarMenuNode {
  id: number;
  name: string;
  path: string | null;
  parent_id: number | null;
  sort: number;
  icon: string | null;
  type: number;
  component: string | null;
  perms: string | null;
  status: number;
  display: number;
  cache: number;
  link: string | null;
  remark: string | null;
  meta: MenuMeta;
  children?: SidebarMenuNode[] | null;
}

export interface MenuParams {
  title?: string;
  status?: number;
}

export interface MenuPayload {
  title: string;
  name: string;
  path?: string | null;
  parent_id?: number | null;
  sort: number;
  icon?: string | null;
  type: number;
  component?: string | null;
  perms?: string | null;
  status: number;
  display: number;
  cache: number;
  link?: string | null;
  remark?: string | null;
}
