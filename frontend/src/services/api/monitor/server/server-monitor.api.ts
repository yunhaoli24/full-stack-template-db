import type { AxiosError } from "axios";

import { useQuery } from "@tanstack/vue-query";

import { useAxios } from "@/composables/use-axios";

import type {
  BackendResponse,
  ServerCpuInfo,
  ServerDiskInfo,
  ServerMemInfo,
  ServerMonitorData,
  ServerServiceInfo,
  ServerSysInfo,
} from "@/services/types";

export type {
  ServerCpuInfo,
  ServerDiskInfo,
  ServerMemInfo,
  ServerMonitorData,
  ServerServiceInfo,
  ServerSysInfo,
};

const SERVER_MONITOR_QUERY_KEY = ["server-monitor"];

function ensureSuccess<T>(response: BackendResponse<T>): BackendResponse<T> {
  const code = Number(response.code);
  if (!Number.isFinite(code) || code !== 200) {
    throw new Error(response.msg || "Request failed");
  }
  return response;
}

export function useGetServerMonitorQuery() {
  const { axiosInstance } = useAxios();

  return useQuery<BackendResponse<ServerMonitorData>, AxiosError>({
    queryKey: SERVER_MONITOR_QUERY_KEY,
    queryFn: async () => {
      const response =
        await axiosInstance.get<BackendResponse<ServerMonitorData>>("/monitors/server");
      return ensureSuccess(response.data);
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}
