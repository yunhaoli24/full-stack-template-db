import type { AxiosError } from "axios";

import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

import { useAxios } from "@/composables/use-axios";

import type { BackendResponse } from "../types/response.type";

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

const MENU_TREE_QUERY_KEY = ["menu-tree"];
const MENU_SIDEBAR_QUERY_KEY = ["menu-sidebar"];

function ensureSuccess<T>(response: BackendResponse<T>): BackendResponse<T> {
  const code = Number(response.code);
  if (!Number.isFinite(code) || code !== 200) {
    throw new Error(response.msg || "Request failed");
  }
  return response;
}

export function useGetMenuTreeQuery(params?: MaybeRefOrGetter<MenuParams | undefined>) {
  const { axiosInstance } = useAxios();
  const resolvedParams = computed(() => toValue(params) ?? {});

  return useQuery<BackendResponse<MenuTreeNode[]>, AxiosError>({
    queryKey: computed(() => [...MENU_TREE_QUERY_KEY, resolvedParams.value]),
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<MenuTreeNode[]>>("/sys/menus", {
        params: resolvedParams.value,
      });
      return ensureSuccess(response.data);
    },
  });
}

export function useGetSidebarMenuQuery(enabled?: MaybeRefOrGetter<boolean>) {
  const { axiosInstance } = useAxios();
  const isEnabled = computed(() => (enabled === undefined ? true : toValue(enabled)));

  return useQuery<BackendResponse<SidebarMenuNode[]>, AxiosError>({
    queryKey: MENU_SIDEBAR_QUERY_KEY,
    queryFn: async () => {
      const response =
        await axiosInstance.get<BackendResponse<SidebarMenuNode[]>>("/sys/menus/sidebar");
      return ensureSuccess(response.data);
    },
    enabled: isEnabled,
    refetchOnWindowFocus: false,
  });
}

export function useCreateMenuMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, MenuPayload>({
    mutationKey: ["create-menu"],
    mutationFn: async (payload) => {
      const response = await axiosInstance.post<BackendResponse<null>>("/sys/menus", payload);
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MENU_TREE_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: MENU_SIDEBAR_QUERY_KEY });
    },
  });
}

export function useUpdateMenuMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, { id: number; payload: MenuPayload }>({
    mutationKey: ["update-menu"],
    mutationFn: async ({ id, payload }) => {
      const response = await axiosInstance.put<BackendResponse<null>>(`/sys/menus/${id}`, payload);
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MENU_TREE_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: MENU_SIDEBAR_QUERY_KEY });
    },
  });
}

export function useDeleteMenuMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, number>({
    mutationKey: ["delete-menu"],
    mutationFn: async (id) => {
      const response = await axiosInstance.delete<BackendResponse<null>>(`/sys/menus/${id}`);
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MENU_TREE_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: MENU_SIDEBAR_QUERY_KEY });
    },
  });
}
