import { toast } from "vue-sonner";
import pinia from "@/plugins/pinia/setup";
import { useAuthStore } from "@/stores/auth";
import { useAxios } from "./use-axios";

export function useAuth() {
  const router = useRouter();
  const { axiosInstance } = useAxios();

  const authStore = useAuthStore(pinia);
  const loading = ref(false);

  function logout() {
    // TODO: 调用后端logout接口
    authStore.clearAuthInfo();
    void router.push({ path: "/auth/sign-in" });
  }

  function toHome() {
    void router.push({ path: "/dashboard" });
  }

  async function login(username: string, password: string, uuid?: string, captcha?: string) {
    loading.value = true;
    try {
      const payload: any = {
        username,
        password,
      };

      // 如果提供了验证码参数，添加到请求中
      if (uuid && captcha) {
        payload.uuid = uuid;
        payload.captcha = captcha;
      }

      const response = await axiosInstance.post("/auth/login", payload);

      // 后端返回格式: { code: 200, msg: 'success', data: { access_token, access_token_expire_time, session_uuid, user } }
      const { code, data } = response.data;
      if (code === 200) {
        // 存储认证信息到store
        authStore.setAuthInfo(data.access_token, data.session_uuid, data.user);

        const redirect = router.currentRoute.value.query.redirect as string;
        if (!redirect || redirect.startsWith("//")) {
          toHome();
        } else {
          void router.push(redirect);
        }
      } else {
        // 处理其他错误码，使用后端返回的错误消息
        const errorMsg = response.data.msg || "Login failed";
        // 验证码错误时显示 toast 通知
        if (code === 40001) {
          toast.error(errorMsg);
        }
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      // 如果错误响应有数据，使用后端返回的错误消息
      if (error.response?.data?.msg) {
        const errorMsg = error.response.data.msg;
        // 验证码错误时显示 toast 通知
        if (error.response?.data?.code === 40001) {
          toast.error(errorMsg);
        }
        throw new Error(errorMsg);
      }
      // 否则使用原始错误消息
      throw new Error(error.message || "Login failed");
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    logout,
    login,
  };
}
