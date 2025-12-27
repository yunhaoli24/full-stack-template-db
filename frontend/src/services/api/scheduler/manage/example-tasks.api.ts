import type { AxiosError } from "axios";

import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";

import { useAxios } from "@/composables/use-axios";

import type { BackendResponse } from "../types/response.type";

export interface ITask {
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
}

export function useGetTasksQuery() {
  const { axiosInstance } = useAxios();

  return useQuery<BackendResponse<ITask[]>, AxiosError>({
    queryKey: ["useGetTasksQuery"],
    queryFn: async () => {
      const response = await axiosInstance.get("/tasks");
      return response.data;
    },
  });
}

export function useGetTaskByIdQuery(id: number) {
  const { axiosInstance } = useAxios();

  return useQuery<BackendResponse<ITask>, AxiosError>({
    queryKey: ["useGetTaskQuery", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/tasks/${id}`);
      return response.data;
    },
  });
}

export function useUpdateTaskMutation(id: number) {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<boolean>, AxiosError, Partial<ITask>>({
    mutationKey: ["useUpdateTaskMutation", id],
    mutationFn: async (data: Partial<ITask>) => {
      const response = await axiosInstance.put<BackendResponse<boolean>>(`/tasks/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["useGetTaskQuery", id] });
      void queryClient.invalidateQueries({ queryKey: ["useGetTasksQuery"] });
    },
  });
}

export function useCreateTaskMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<ITask>, AxiosError, ITask>({
    mutationKey: ["useCreateTaskMutation"],
    mutationFn: async (data: ITask) => {
      const response = await axiosInstance.post<BackendResponse<ITask>>("/tasks", data);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["useGetTasksQuery"] });
    },
  });
}

export function useDeleteTaskMutation() {
  const { axiosInstance } = useAxios();
  const queryClient = useQueryClient();

  return useMutation<BackendResponse<boolean>, AxiosError, number>({
    mutationKey: ["useDeleteTaskMutation"],
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete<BackendResponse<boolean>>(`/tasks/${id}`);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["useGetTasksQuery"] });
    },
  });
}
