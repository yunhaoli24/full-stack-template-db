import type { AxiosError } from "axios";

import { useQuery } from "@tanstack/vue-query";

import { useAxios } from "@/composables/use-axios";

import type { BackendResponse } from "../types/response.type";

export interface RedisInfo {
  [key: string]: string;
}

export interface RedisCommandStat {
  name: string;
  value: string;
}

export interface RedisMonitorData {
  info: RedisInfo;
  stats: RedisCommandStat[];
}

const REDIS_MONITOR_QUERY_KEY = ["redis-monitor"];

function ensureSuccess<T>(response: BackendResponse<T>): BackendResponse<T> {
  const code = Number(response.code);
  if (!Number.isFinite(code) || code !== 200) {
    throw new Error(response.msg || "Request failed");
  }
  return response;
}

export function useGetRedisMonitorQuery() {
  const { axiosInstance } = useAxios();

  return useQuery<BackendResponse<RedisMonitorData>, AxiosError>({
    queryKey: REDIS_MONITOR_QUERY_KEY,
    queryFn: async () => {
      const response =
        await axiosInstance.get<BackendResponse<RedisMonitorData>>("/monitors/redis");
      return ensureSuccess(response.data);
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}
