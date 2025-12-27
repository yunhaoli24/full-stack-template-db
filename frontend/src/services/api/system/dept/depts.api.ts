import type { AxiosError } from "axios";

import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

import { useAxios } from "@/composables/use-axios";

import type { BackendResponse } from "../types/response.type";

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

const DEPT_TREE_QUERY_KEY = ["dept-tree"];

function ensureSuccess<T>(response: BackendResponse<T>): BackendResponse<T> {
  const code = Number(response.code);
  if (!Number.isFinite(code) || code !== 200) {
    throw new Error(response.msg || "Request failed");
  }
  return response;
}

export function useGetDeptTreeQuery(params?: MaybeRefOrGetter<DeptParams | undefined>) {
  const { axiosInstance } = useAxios();
  const resolvedParams = computed(() => toValue(params) ?? {});

  return useQuery<BackendResponse<DeptTreeNode[]>, AxiosError>({
    queryKey: computed(() => [...DEPT_TREE_QUERY_KEY, resolvedParams.value]),
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<DeptTreeNode[]>>("/sys/depts", {
        params: resolvedParams.value,
      });
      return ensureSuccess(response.data);
    },
  });
}

export function useCreateDeptMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, DeptPayload>({
    mutationKey: ["create-dept"],
    mutationFn: async (payload) => {
      const response = await axiosInstance.post<BackendResponse<null>>("/sys/depts", payload);
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DEPT_TREE_QUERY_KEY });
    },
  });
}

export function useUpdateDeptMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, { id: number; payload: DeptPayload }>({
    mutationKey: ["update-dept"],
    mutationFn: async ({ id, payload }) => {
      const response = await axiosInstance.put<BackendResponse<null>>(`/sys/depts/${id}`, payload);
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DEPT_TREE_QUERY_KEY });
    },
  });
}

export function useDeleteDeptMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, number>({
    mutationKey: ["delete-dept"],
    mutationFn: async (id) => {
      const response = await axiosInstance.delete<BackendResponse<null>>(`/sys/depts/${id}`);
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DEPT_TREE_QUERY_KEY });
    },
  });
}
