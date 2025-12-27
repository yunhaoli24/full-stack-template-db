import type { AxiosError } from "axios";

import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

import { useAxios } from "@/composables/use-axios";

import type { BackendResponse, OperaLog, OperaLogParams, PageData } from "@/services/types";

export type { OperaLog, OperaLogParams };

const OPERA_LOGS_QUERY_KEY = ["opera-logs"];

function ensureSuccess<T>(response: BackendResponse<T>): BackendResponse<T> {
  const code = Number(response.code);
  if (!Number.isFinite(code) || code !== 200) {
    throw new Error(response.msg || "Request failed");
  }
  return response;
}

export function useGetOperaLogsQuery(params?: MaybeRefOrGetter<OperaLogParams | undefined>) {
  const { axiosInstance } = useAxios();
  const resolvedParams = computed(() => toValue(params) ?? {});

  return useQuery<BackendResponse<PageData<OperaLog>>, AxiosError>({
    queryKey: computed(() => [...OPERA_LOGS_QUERY_KEY, resolvedParams.value]),
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<PageData<OperaLog>>>("/logs/opera", {
        params: resolvedParams.value,
      });
      return ensureSuccess(response.data);
    },
  });
}

export function useDeleteOperaLogsMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, number[]>({
    mutationKey: ["delete-opera-logs"],
    mutationFn: async (pks) => {
      const response = await axiosInstance.delete<BackendResponse<null>>("/logs/opera", {
        data: { pks },
      });
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: OPERA_LOGS_QUERY_KEY });
    },
  });
}

export function useDeleteAllOperaLogsMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, void>({
    mutationKey: ["delete-all-opera-logs"],
    mutationFn: async () => {
      const response = await axiosInstance.delete<BackendResponse<null>>("/logs/opera/all");
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: OPERA_LOGS_QUERY_KEY });
    },
  });
}
