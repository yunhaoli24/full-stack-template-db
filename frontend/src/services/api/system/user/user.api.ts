import type { AxiosError } from "axios";

import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

import { useAxios } from "@/composables/use-axios";

import type {
  BackendResponse,
  CreateUserPayload,
  CurrentUser,
  PageData,
  ResetPasswordPayload,
  UpdateEmailPayload,
  UpdateUserPayload,
  UserDetail,
  UserParams,
} from "@/services/types";

export type {
  CreateUserPayload,
  CurrentUser,
  ResetPasswordPayload,
  UpdateEmailPayload,
  UpdateUserPayload,
  UserDetail,
  UserParams,
};

const CURRENT_USER_QUERY_KEY = ["current-user"];
const USERS_QUERY_KEY = ["users"];

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

export function useGetUsersQuery(params?: MaybeRefOrGetter<UserParams | undefined>) {
  const { axiosInstance } = useAxios();
  const resolvedParams = computed(() => toValue(params) ?? {});

  return useQuery<BackendResponse<PageData<UserDetail>>, AxiosError>({
    queryKey: computed(() => [...USERS_QUERY_KEY, "all", resolvedParams.value]),
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<PageData<UserDetail>>>(
        "/sys/users",
        {
          params: resolvedParams.value,
        },
      );
      return ensureSuccess(response.data);
    },
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

export function useCreateUserMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<UserDetail>, AxiosError, CreateUserPayload>({
    mutationKey: ["create-user"],
    mutationFn: async (payload) => {
      const response = await axiosInstance.post<BackendResponse<UserDetail>>("/sys/users", payload);
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}

export function useUpdateUserMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, { id: number; payload: UpdateUserPayload }>(
    {
      mutationKey: ["update-user"],
      mutationFn: async ({ id, payload }) => {
        const response = await axiosInstance.put<BackendResponse<null>>(
          `/sys/users/${id}`,
          payload,
        );
        return ensureSuccess(response.data);
      },
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      },
    },
  );
}

export function useDeleteUserMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, number>({
    mutationKey: ["delete-user"],
    mutationFn: async (id) => {
      const response = await axiosInstance.delete<BackendResponse<null>>(`/sys/users/${id}`);
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}

export function useResetUserPasswordMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, { id: number; password: string }>({
    mutationKey: ["reset-user-password"],
    mutationFn: async ({ id, password }) => {
      const response = await axiosInstance.put<BackendResponse<null>>(`/sys/users/${id}/password`, {
        password,
      });
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}
