import type { AxiosError } from "axios";

import { useQuery } from "@tanstack/vue-query";

import { useAxios } from "@/composables/use-axios";

import type { BackendResponse } from "../types/response.type";

export interface ServerCpuInfo {
  usage: number;
  logical_num: number;
  physical_num: number;
  max_freq: number;
  min_freq: number;
  current_freq: number;
}

export interface ServerMemInfo {
  total: number;
  used: number;
  free: number;
  usage: number;
}

export interface ServerSysInfo {
  name: string;
  ip: string;
  os: string;
  arch: string;
}

export interface ServerDiskInfo {
  dir: string;
  type: string;
  device: string;
  total: string;
  free: string;
  used: string;
  usage: string;
}

export interface ServerServiceInfo {
  name: string;
  version: string;
  home: string;
  cpu_usage: string;
  mem_vms: string;
  mem_rss: string;
  mem_free: string;
  startup: string;
  elapsed: string;
}

export interface ServerMonitorData {
  cpu: ServerCpuInfo;
  mem: ServerMemInfo;
  sys: ServerSysInfo;
  disk: ServerDiskInfo[];
  service: ServerServiceInfo;
}

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
