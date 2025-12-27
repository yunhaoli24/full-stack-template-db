import type { AxiosError } from "axios";

import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

import { useAxios } from "@/composables/use-axios";

import type { BackendResponse, PageData } from "../types/response.type";

export interface TaskScheduler {
  id: number;
  name: string;
  task: string;
  args: unknown;
  kwargs: unknown;
  queue: string | null;
  exchange: string | null;
  routing_key: string | null;
  start_time: string | null;
  expire_time: string | null;
  expire_seconds: number | null;
  type: number;
  interval_every: number | null;
  interval_period: string | null;
  crontab: string;
  one_off: boolean;
  enabled: boolean;
  total_run_count: number;
  last_run_time: string | null;
  remark: string | null;
  created_time: string;
  updated_time: string | null;
}

export interface TaskSchedulerParams {
  name?: string;
  type?: number;
}

export interface TaskSchedulerPayload {
  name: string;
  task: string;
  args?: unknown;
  kwargs?: unknown;
  queue?: string | null;
  exchange?: string | null;
  routing_key?: string | null;
  start_time?: string | null;
  expire_time?: string | null;
  expire_seconds?: number | null;
  type: number;
  interval_every?: number | null;
  interval_period?: string | null;
  crontab: string;
  one_off?: boolean;
  remark?: string | null;
}

const SCHEDULERS_QUERY_KEY = ["schedulers"];

function ensureSuccess<T>(response: BackendResponse<T>): BackendResponse<T> {
  const code = Number(response.code);
  if (!Number.isFinite(code) || code !== 200) {
    throw new Error(response.msg || "Request failed");
  }
  return response;
}

export function useGetSchedulersQuery(params?: MaybeRefOrGetter<TaskSchedulerParams | undefined>) {
  const { axiosInstance } = useAxios();
  const resolvedParams = computed(() => toValue(params) ?? {});

  return useQuery<BackendResponse<PageData<TaskScheduler>>, AxiosError>({
    queryKey: computed(() => [...SCHEDULERS_QUERY_KEY, resolvedParams.value]),
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<PageData<TaskScheduler>>>(
        "/schedulers",
        {
          params: resolvedParams.value,
        },
      );
      return ensureSuccess(response.data);
    },
  });
}

export function useGetAllSchedulersQuery() {
  const { axiosInstance } = useAxios();

  return useQuery<BackendResponse<TaskScheduler[]>, AxiosError>({
    queryKey: ["all-schedulers"],
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<TaskScheduler[]>>("/schedulers/all");
      return ensureSuccess(response.data);
    },
  });
}

export function useGetSchedulerDetailQuery(id: MaybeRefOrGetter<number>) {
  const { axiosInstance } = useAxios();
  const resolvedId = computed(() => toValue(id));

  return useQuery<BackendResponse<TaskScheduler>, AxiosError>({
    queryKey: computed(() => ["scheduler", resolvedId.value]),
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<TaskScheduler>>(
        `/schedulers/${resolvedId.value}`,
      );
      return ensureSuccess(response.data);
    },
    enabled: computed(() => !!resolvedId.value),
  });
}

export function useCreateSchedulerMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, TaskSchedulerPayload>({
    mutationKey: ["create-scheduler"],
    mutationFn: async (payload) => {
      const response = await axiosInstance.post<BackendResponse<null>>("/schedulers", payload);
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SCHEDULERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["all-schedulers"] });
    },
  });
}

export function useUpdateSchedulerMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<
    BackendResponse<null>,
    AxiosError,
    { id: number; payload: TaskSchedulerPayload }
  >({
    mutationKey: ["update-scheduler"],
    mutationFn: async ({ id, payload }) => {
      const response = await axiosInstance.put<BackendResponse<null>>(`/schedulers/${id}`, payload);
      return ensureSuccess(response.data);
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: SCHEDULERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["all-schedulers"] });
      void queryClient.invalidateQueries({ queryKey: ["scheduler", variables.id] });
    },
  });
}

export function useUpdateSchedulerStatusMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, number>({
    mutationKey: ["update-scheduler-status"],
    mutationFn: async (id) => {
      const response = await axiosInstance.put<BackendResponse<null>>(`/schedulers/${id}/status`);
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SCHEDULERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["all-schedulers"] });
    },
  });
}

export function useDeleteSchedulerMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, number>({
    mutationKey: ["delete-scheduler"],
    mutationFn: async (id) => {
      const response = await axiosInstance.delete<BackendResponse<null>>(`/schedulers/${id}`);
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SCHEDULERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["all-schedulers"] });
    },
  });
}

export function useExecuteSchedulerMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, number>({
    mutationKey: ["execute-scheduler"],
    mutationFn: async (id) => {
      const response = await axiosInstance.post<BackendResponse<null>>(`/schedulers/${id}/execute`);
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SCHEDULERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["all-schedulers"] });
    },
  });
}
