import type { AxiosError } from "axios";

import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

import { useAxios } from "@/composables/use-axios";

import type { BackendResponse, PageData } from "../types/response.type";

export interface TaskResult {
  id: number;
  task_id: string;
  status: string;
  result: unknown;
  date_done: string | null;
  traceback: string | null;
  name: string | null;
  args: unknown;
  kwargs: unknown;
  worker: string | null;
  retries: number | null;
  queue: string | null;
}

export interface TaskResultParams {
  name?: string;
  task_id?: string;
}

const TASK_RESULTS_QUERY_KEY = ["task-results"];

function ensureSuccess<T>(response: BackendResponse<T>): BackendResponse<T> {
  const code = Number(response.code);
  if (!Number.isFinite(code) || code !== 200) {
    throw new Error(response.msg || "Request failed");
  }
  return response;
}

export function useGetTaskResultsQuery(params?: MaybeRefOrGetter<TaskResultParams | undefined>) {
  const { axiosInstance } = useAxios();
  const resolvedParams = computed(() => toValue(params) ?? {});

  return useQuery<BackendResponse<PageData<TaskResult>>, AxiosError>({
    queryKey: computed(() => [...TASK_RESULTS_QUERY_KEY, resolvedParams.value]),
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<PageData<TaskResult>>>(
        "/task-results",
        {
          params: resolvedParams.value,
        },
      );
      return ensureSuccess(response.data);
    },
  });
}

export function useGetTaskResultDetailQuery(id: MaybeRefOrGetter<number>) {
  const { axiosInstance } = useAxios();
  const resolvedId = computed(() => toValue(id));

  return useQuery<BackendResponse<TaskResult>, AxiosError>({
    queryKey: computed(() => ["task-result", resolvedId.value]),
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<TaskResult>>(
        `/task-results/${resolvedId.value}`,
      );
      return ensureSuccess(response.data);
    },
    enabled: computed(() => !!resolvedId.value),
  });
}

export function useDeleteTaskResultsMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, number[]>({
    mutationKey: ["delete-task-results"],
    mutationFn: async (pks) => {
      const response = await axiosInstance.delete<BackendResponse<null>>("/task-results", {
        data: { pks },
      });
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TASK_RESULTS_QUERY_KEY });
    },
  });
}
