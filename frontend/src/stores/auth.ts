import { defineStore } from "pinia";

export const useAuthStore = defineStore(
  "user",
  () => {
    const isLogin = ref(false);
    const accessToken = ref("");
    const sessionUuid = ref("");
    const userInfo = ref<any>(null);

    // 设置认证信息
    function setAuthInfo(token: string, sessionId: string, user: any) {
      accessToken.value = token;
      sessionUuid.value = sessionId;
      userInfo.value = user;
      isLogin.value = true;
    }

    // 清除认证信息
    function clearAuthInfo() {
      accessToken.value = "";
      sessionUuid.value = "";
      userInfo.value = null;
      isLogin.value = false;
    }

    return {
      isLogin,
      accessToken,
      sessionUuid,
      userInfo,
      setAuthInfo,
      clearAuthInfo,
    };
  },
  {
    persist: true,
  },
);
