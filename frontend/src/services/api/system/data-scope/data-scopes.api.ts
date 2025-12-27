import type { AxiosError } from "axios";

import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

import { useAxios } from "@/composables/use-axios";

import type {
  BackendResponse,
  DataScopeDetail,
  DataScopeParams,
  DataScopePayload,
  DataScopeWithRelationDetail,
} from "@/services/types";

export type { DataScopeDetail, DataScopeParams, DataScopePayload, DataScopeWithRelationDetail };

const DATA_SCOPE_QUERY_KEY = ["data-scope"];

function ensureSuccess<T>(response: BackendResponse<T>): BackendResponse<T> {
  const code = Number(response.code);
  if (!Number.isFinite(code) || code !== 200) {
    throw new Error(response.msg || "Request failed");
  }
  return response;
}

export function useGetDataScopesQuery(params?: MaybeRefOrGetter<DataScopeParams | undefined>) {
  const { axiosInstance } = useAxios();
  const resolvedParams = computed(() => toValue(params) ?? {});

  return useQuery<BackendResponse<DataScopeDetail[]>, AxiosError>({
    queryKey: computed(() => [...DATA_SCOPE_QUERY_KEY, "all", resolvedParams.value]),
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<DataScopeDetail[]>>(
        "/sys/data-scopes/all",
        {
          params: resolvedParams.value,
        },
      );
      return ensureSuccess(response.data);
    },
  });
}

export function useGetDataScopeRulesQuery(id: MaybeRefOrGetter<number>) {
  const { axiosInstance } = useAxios();
  const resolvedId = computed(() => toValue(id));

  return useQuery<BackendResponse<DataScopeWithRelationDetail>, AxiosError>({
    queryKey: computed(() => [...DATA_SCOPE_QUERY_KEY, "rules", resolvedId.value]),
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<DataScopeWithRelationDetail>>(
        `/sys/data-scopes/${resolvedId.value}/rules`,
      );
      return ensureSuccess(response.data);
    },
    enabled: computed(() => resolvedId.value > 0),
  });
}

export function useCreateDataScopeMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, DataScopePayload>({
    mutationKey: ["create-data-scope"],
    mutationFn: async (payload) => {
      const response = await axiosInstance.post<BackendResponse<null>>("/sys/data-scopes", payload);
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DATA_SCOPE_QUERY_KEY });
    },
  });
}

export function useUpdateDataScopeMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, { id: number; payload: DataScopePayload }>({
    mutationKey: ["update-data-scope"],
    mutationFn: async ({ id, payload }) => {
      const response = await axiosInstance.put<BackendResponse<null>>(
        `/sys/data-scopes/${id}`,
        payload,
      );
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DATA_SCOPE_QUERY_KEY });
    },
  });
}

export function useUpdateDataScopeRulesMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, { id: number; ruleIds: number[] }>({
    mutationKey: ["update-data-scope-rules"],
    mutationFn: async ({ id, ruleIds }) => {
      const response = await axiosInstance.put<BackendResponse<null>>(
        `/sys/data-scopes/${id}/rules`,
        { rules: ruleIds },
      );
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DATA_SCOPE_QUERY_KEY });
    },
  });
}

export function useDeleteDataScopeMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, number[]>({
    mutationKey: ["delete-data-scope"],
    mutationFn: async (ids) => {
      const response = await axiosInstance.delete<BackendResponse<null>>("/sys/data-scopes", {
        data: { pks: ids },
      });
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DATA_SCOPE_QUERY_KEY });
    },
  });
}
