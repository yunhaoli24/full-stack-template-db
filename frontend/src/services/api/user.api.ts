import type { AxiosError } from "axios";

import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

import { useAxios } from "@/composables/use-axios";

import type { BackendResponse } from "../types/response.type";

export interface CurrentUser {
  id: number;
  username: string;
  nickname: string;
  avatar: string | null;
  email: string | null;
  phone: string | null;
  dept?: string | null;
  roles?: string[];
}

export interface UpdateEmailPayload {
  email: string;
  captcha: string;
}

const CURRENT_USER_QUERY_KEY = ["current-user"];

function ensureSuccess<T>(response: BackendResponse<T>): BackendResponse<T> {
  const code = Number(response.code);
  if (!Number.isFinite(code) || code !== 200) {
    throw new Error(response.msg || "Request failed");
  }
  return response;
}

export function useGetCurrentUserQuery(enabled?: MaybeRefOrGetter<boolean>) {
  const { axiosInstance } = useAxios();
  const isEnabled = computed(() => (enabled === undefined ? true : toValue(enabled)));

  return useQuery<BackendResponse<CurrentUser>, AxiosError>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<CurrentUser>>("/sys/users/me");
      return ensureSuccess(response.data);
    },
    enabled: isEnabled,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateCurrentUserNicknameMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, string>({
    mutationKey: ["update-current-user-nickname"],
    mutationFn: async (nickname: string) => {
      const response = await axiosInstance.put<BackendResponse<null>>("/sys/users/me/nickname", {
        nickname,
      });
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    },
  });
}

export function useUpdateCurrentUserAvatarMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, string>({
    mutationKey: ["update-current-user-avatar"],
    mutationFn: async (avatar: string) => {
      const response = await axiosInstance.put<BackendResponse<null>>("/sys/users/me/avatar", {
        avatar,
      });
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    },
  });
}

export function useUpdateCurrentUserEmailMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, UpdateEmailPayload>({
    mutationKey: ["update-current-user-email"],
    mutationFn: async (payload: UpdateEmailPayload) => {
      const response = await axiosInstance.put<BackendResponse<null>>(
        "/sys/users/me/email",
        payload,
      );
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    },
  });
}

export function useSendEmailCaptchaMutation() {
  const { axiosInstance } = useAxios();

  return useMutation<BackendResponse<null>, AxiosError, string>({
    mutationKey: ["send-email-captcha"],
    mutationFn: async (recipients: string) => {
      const response = await axiosInstance.post<BackendResponse<null>>("/emails/captcha", {
        recipients,
      });
      return ensureSuccess(response.data);
    },
  });
}
