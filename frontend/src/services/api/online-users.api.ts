import type { AxiosError } from "axios";

import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

import { useAxios } from "@/composables/use-axios";

import type { BackendResponse } from "../types/response.type";

export interface OnlineUserDetail {
  id: number;
  session_uuid: string;
  username: string;
  nickname: string;
  ip: string;
  os: string;
  browser: string;
  device: string;
  status: number;
  last_login_time: string;
  expire_time: string;
}

export interface OnlineUserParams {
  username?: string;
}

const ONLINE_USERS_QUERY_KEY = ["online-users"];

function ensureSuccess<T>(response: BackendResponse<T>): BackendResponse<T> {
  const code = Number(response.code);
  if (!Number.isFinite(code) || code !== 200) {
    throw new Error(response.msg || "Request failed");
  }
  return response;
}

export function useGetOnlineUsersQuery(params?: MaybeRefOrGetter<OnlineUserParams | undefined>) {
  const { axiosInstance } = useAxios();
  const resolvedParams = computed(() => toValue(params) ?? {});

  return useQuery<BackendResponse<OnlineUserDetail[]>, AxiosError>({
    queryKey: computed(() => [...ONLINE_USERS_QUERY_KEY, resolvedParams.value]),
    queryFn: async () => {
      const response = await axiosInstance.get<BackendResponse<OnlineUserDetail[]>>(
        "/monitors/sessions",
        {
          params: resolvedParams.value,
        },
      );
      return ensureSuccess(response.data);
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useKickOnlineUserMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<null>, AxiosError, { id: number; sessionUuid: string }>({
    mutationKey: ["kick-online-user"],
    mutationFn: async ({ id, sessionUuid }) => {
      const response = await axiosInstance.delete<BackendResponse<null>>(
        `/monitors/sessions/${id}?session_uuid=${sessionUuid}`,
      );
      return ensureSuccess(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ONLINE_USERS_QUERY_KEY });
    },
  });
}
