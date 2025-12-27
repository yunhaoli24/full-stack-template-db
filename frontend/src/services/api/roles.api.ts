import type { AxiosError } from "axios";

import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

import { useAxios } from "@/composables/use-axios";

import type { BackendResponse } from "../types/response.type";

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

export interface PageData<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

const ROLES_QUERY_KEY = ["roles"];
const ALL_ROLES_QUERY_KEY = ["all-roles"];

function ensureSuccess<T>(response: BackendResponse<T>): BackendResponse<T> {
  const code = Number(response.code);
  if (!Number.isFinite(code) || code !== 200) {
    throw new Error(response.msg || "Request failed");
  }
  return response;
}

export function useGetAllRolesQuery() {
  const { axiosInstance } = useAxios();

  return useQuery<BackendResponse<RoleDetail[]>, AxiosError>({
    queryKey: ALL_ROLES_QUERY_KEY,
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<RoleDetail[]>>("/sys/roles/all");
      return ensureSuccess(response.data);
    },
  });
}

export function useGetRolesQuery(params?: MaybeRefOrGetter<RoleParams | undefined>) {
  const { axiosInstance } = useAxios();
  const resolvedParams = computed(() => toValue(params) ?? {});

  return useQuery<BackendResponse<PageData<RoleDetail>>, AxiosError>({
    queryKey: computed(() => [...ROLES_QUERY_KEY, "all", resolvedParams.value]),
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<PageData<RoleDetail>>>(
        "/sys/roles",
        {
          params: resolvedParams.value,
        },
      );
      return ensureSuccess(response.data);
    },
  });
}

export function useGetRoleMenusQuery(roleId: number) {
  const { axiosInstance } = useAxios();

  return useQuery<BackendResponse<MenuTreeNode[] | null>, AxiosError>({
    queryKey: [...ROLES_QUERY_KEY, roleId, "menus"],
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<MenuTreeNode[] | null>>(
        `/sys/roles/${roleId}/menus`,
      );
      return ensureSuccess(response.data);
    },
    enabled: computed(() => !!roleId),
  });
}

export function useGetRoleScopesQuery(roleId: number) {
  const { axiosInstance } = useAxios();

  return useQuery<BackendResponse<number[]>, AxiosError>({
    queryKey: [...ROLES_QUERY_KEY, roleId, "scopes"],
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<number[]>>(
        `/sys/roles/${roleId}/scopes`,
      );
      return ensureSuccess(response.data);
    },
    enabled: computed(() => !!roleId),
  });
}

export function useCreateRoleMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, CreateRolePayload>({
    mutationKey: ["create-role"],
    mutationFn: async (payload) => {
      const response = await axiosInstance.post<BackendResponse<null>>("/sys/roles", payload);
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ALL_ROLES_QUERY_KEY });
    },
  });
}

export function useUpdateRoleMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, { id: number; payload: UpdateRolePayload }>(
    {
      mutationKey: ["update-role"],
      mutationFn: async ({ id, payload }) => {
        const response = await axiosInstance.put<BackendResponse<null>>(
          `/sys/roles/${id}`,
          payload,
        );
        return ensureSuccess(response.data);
      },
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
        void queryClient.invalidateQueries({ queryKey: ALL_ROLES_QUERY_KEY });
      },
    },
  );
}

export function useUpdateRoleMenusMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<
    BackendResponse<null>,
    AxiosError,
    { id: number; payload: UpdateRoleMenusPayload }
  >({
    mutationKey: ["update-role-menus"],
    mutationFn: async ({ id, payload }) => {
      const response = await axiosInstance.put<BackendResponse<null>>(
        `/sys/roles/${id}/menus`,
        payload,
      );
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
    },
  });
}

export function useUpdateRoleScopesMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<
    BackendResponse<null>,
    AxiosError,
    { id: number; payload: UpdateRoleScopesPayload }
  >({
    mutationKey: ["update-role-scopes"],
    mutationFn: async ({ id, payload }) => {
      const response = await axiosInstance.put<BackendResponse<null>>(
        `/sys/roles/${id}/scopes`,
        payload,
      );
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
    },
  });
}

export function useDeleteRoleMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, number[]>({
    mutationKey: ["delete-role"],
    mutationFn: async (ids) => {
      const response = await axiosInstance.delete<BackendResponse<null>>("/sys/roles", {
        data: { pks: ids },
      });
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ALL_ROLES_QUERY_KEY });
    },
  });
}
