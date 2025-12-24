import type { AxiosError } from "axios";

import axios from "axios";

import env from "@/utils/env";
import pinia from "@/plugins/pinia/setup";
import { useAuthStore } from "@/stores/auth";

export function useAxios() {
  const authStore = useAuthStore(pinia);
  const axiosInstance = axios.create({
    baseURL: env.VITE_SERVER_API_URL + env.VITE_SERVER_API_PREFIX,
    timeout: env.VITE_SERVER_API_TIMEOUT,
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      // 添加token到请求头
      const token = authStore.accessToken.value;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  axiosInstance.interceptors.response.use(
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
          window.location.href = "/auth/sign-in";
        }
      }
      return Promise.reject(error);
    },
  );

  return {
    axiosInstance,
  };
}
