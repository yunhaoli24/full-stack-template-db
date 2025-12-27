import type { AxiosError } from "axios";

import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

import { useAxios } from "@/composables/use-axios";

import type { BackendResponse, PageData } from "../types/response.type";

export enum NoticeType {
  Notice = 0,
  Announcement = 1,
}

export enum NoticeStatus {
  Hidden = 0,
  Visible = 1,
}

export interface Notice {
  id: number;
  title: string;
  type: NoticeType;
  status: NoticeStatus;
  content: string;
  created_time: string;
  updated_time: string | null;
}

export interface NoticePayload {
  title: string;
  type: NoticeType;
  status: NoticeStatus;
  content: string;
}

export interface NoticeListParams {
  page: number;
  size: number;
  title?: string;
  type?: number;
  status?: number;
}

export interface NoticeUpdatePayload {
  id: number;
  payload: NoticePayload;
}

const NOTICE_QUERY_KEY = ["notices"];

function normalizeListParams(params: NoticeListParams): NoticeListParams {
  const normalized: NoticeListParams = {
    page: params.page,
    size: params.size,
  };

  if (params.title?.trim()) {
    normalized.title = params.title.trim();
  }

  if (params.type !== undefined) {
    normalized.type = params.type;
  }

  if (params.status !== undefined) {
    normalized.status = params.status;
  }

  return normalized;
}

function ensureSuccess<T>(response: BackendResponse<T>): BackendResponse<T> {
  const code = Number(response.code);
  if (!Number.isFinite(code) || code !== 200) {
    throw new Error(response.msg || "Request failed");
  }
  return response;
}

export function useGetNoticesQuery(params: MaybeRefOrGetter<NoticeListParams>) {
  const { axiosInstance } = useAxios();
  const resolvedParams = computed(() => normalizeListParams({ ...toValue(params) }));

  return useQuery<BackendResponse<PageData<Notice>>, AxiosError>({
    queryKey: computed(() => [...NOTICE_QUERY_KEY, resolvedParams.value]),
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<PageData<Notice>>>("/sys/notices", {
        params: resolvedParams.value,
      });
      return ensureSuccess(response.data);
    },
  });
}

export function useCreateNoticeMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, NoticePayload>({
    mutationKey: ["create-notice"],
    mutationFn: async (payload: NoticePayload) => {
      const response = await axiosInstance.post<BackendResponse<null>>("/sys/notices", payload);
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTICE_QUERY_KEY });
    },
  });
}

export function useUpdateNoticeMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, NoticeUpdatePayload>({
    mutationKey: ["update-notice"],
    mutationFn: async ({ id, payload }: NoticeUpdatePayload) => {
      const response = await axiosInstance.put<BackendResponse<null>>(
        `/sys/notices/${id}`,
        payload,
      );
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTICE_QUERY_KEY });
    },
  });
}

export function useDeleteNoticeMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, number[]>({
    mutationKey: ["delete-notice"],
    mutationFn: async (ids: number[]) => {
      const response = await axiosInstance.delete<BackendResponse<null>>("/sys/notices", {
        data: { pks: ids },
      });
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTICE_QUERY_KEY });
    },
  });
}
