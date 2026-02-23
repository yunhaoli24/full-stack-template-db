import axios, { type AxiosError, type AxiosInstance } from "axios";

import router from "@/router";
import pinia from "@/plugins/pinia/setup";
import { useAuthStore } from "@/stores/auth";
import env from "@/utils/env";

let axiosInstance: AxiosInstance | null = null;
let isRedirecting = false;

function createAxiosInstance() {
  const authStore = useAuthStore(pinia);
  const handleAuthInvalid = () => {
    if (isRedirecting) {
      return;
    }
    isRedirecting = true;

    authStore.clearAuthInfo();
    const redirectPath =
      router.currentRoute.value.fullPath ||
      (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/");

    const fallbackRedirect = () => {
      if (typeof window !== "undefined") {
        const url = `/auth/sign-in?redirect=${encodeURIComponent(redirectPath)}`;
        window.location.href = url;
      }
    };

    if (router.currentRoute.value.path !== "/auth/sign-in") {
      void router
        .replace({
          path: "/auth/sign-in",
          query: { redirect: redirectPath },
        })
        .catch(() => fallbackRedirect());

      if (typeof window !== "undefined") {
        window.setTimeout(() => {
          if (router.currentRoute.value.path !== "/auth/sign-in") {
            fallbackRedirect();
          }
        }, 100);
      }
    } else if (typeof window !== "undefined" && window.location.pathname !== "/auth/sign-in") {
      fallbackRedirect();
    }
  };

  const instance = axios.create({
    baseURL: env.VITE_SERVER_API_URL + env.VITE_SERVER_API_PREFIX,
    timeout: env.VITE_SERVER_API_TIMEOUT,
  });

  instance.interceptors.request.use(
    (config) => {
      // 添加token到请求头
      const token = authStore.accessToken;
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
      const responseData = response.data as { code?: number | string; msg?: string } | undefined;
      if (Number(responseData?.code) === 401) {
        handleAuthInvalid();
        return Promise.reject(new Error(responseData.msg || "Unauthorized"));
      }
      return response;
    },
    (error: AxiosError) => {
      // 处理认证错误
      if (error.response?.status === 401) {
        // token过期或无效，清除登录状态
        handleAuthInvalid();
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
