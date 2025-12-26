import axios, { type AxiosError, type AxiosInstance } from "axios";

import pinia from "@/plugins/pinia/setup";
import { useAuthStore } from "@/stores/auth";
import env from "@/utils/env";

let axiosInstance: AxiosInstance | null = null;

function createAxiosInstance() {
  const authStore = useAuthStore(pinia);
  const instance = axios.create({
    baseURL: env.VITE_SERVER_API_URL + env.VITE_SERVER_API_PREFIX,
    timeout: env.VITE_SERVER_API_TIMEOUT,
  });

  instance.interceptors.request.use(
    (config) => {
      // 添加token到请求头
      const token = authStore.accessToken.valueOf;
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError) => {
      // 处理认证错误
      if (error.response?.status === 401) {
        // token过期或无效，清除登录状态
        if (authStore.isLogin) {
          // 清除认证信息
          authStore.clearAuthInfo();
          // 跳转到登录页
          if (typeof window !== "undefined") {
            window.location.href = "/auth/sign-in";
          }
        }
      }
      return Promise.reject(error);
    },
  );

  return instance;
}

function getAxiosInstance() {
  if (!axiosInstance) {
    axiosInstance = createAxiosInstance();
  }

  return axiosInstance;
}

export function useAxios() {
  return {
    axiosInstance: getAxiosInstance(),
  };
}
