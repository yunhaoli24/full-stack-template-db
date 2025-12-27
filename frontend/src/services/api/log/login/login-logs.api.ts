import type { AxiosError } from "axios";

import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

import { useAxios } from "@/composables/use-axios";

import type { BackendResponse, PageData } from "../types/response.type";

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

const LOGIN_LOGS_QUERY_KEY = ["login-logs"];

function ensureSuccess<T>(response: BackendResponse<T>): BackendResponse<T> {
  const code = Number(response.code);
  if (!Number.isFinite(code) || code !== 200) {
    throw new Error(response.msg || "Request failed");
  }
  return response;
}

export function useGetLoginLogsQuery(params?: MaybeRefOrGetter<LoginLogParams | undefined>) {
  const { axiosInstance } = useAxios();
  const resolvedParams = computed(() => toValue(params) ?? {});

  return useQuery<BackendResponse<PageData<LoginLog>>, AxiosError>({
    queryKey: computed(() => [...LOGIN_LOGS_QUERY_KEY, resolvedParams.value]),
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<PageData<LoginLog>>>("/logs/login", {
        params: resolvedParams.value,
      });
      return ensureSuccess(response.data);
    },
  });
}

export function useDeleteLoginLogsMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, number[]>({
    mutationKey: ["delete-login-logs"],
    mutationFn: async (pks) => {
      const response = await axiosInstance.delete<BackendResponse<null>>("/logs/login", {
        data: { pks },
      });
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LOGIN_LOGS_QUERY_KEY });
    },
  });
}

export function useDeleteAllLoginLogsMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, void>({
    mutationKey: ["delete-all-login-logs"],
    mutationFn: async () => {
      const response = await axiosInstance.delete<BackendResponse<null>>("/logs/login/all");
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LOGIN_LOGS_QUERY_KEY });
    },
  });
}
