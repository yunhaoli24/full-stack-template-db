<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useAuth } from "@/composables/use-auth";
import { useAxios } from "@/composables/use-axios";

import ToForgotPasswordLink from "./to-forgot-password-link.vue";
import PrivacyPolicyButton from "./privacy-policy-button.vue";
import TermsOfServiceButton from "./terms-of-service-button.vue";

const { login, loading } = useAuth();
const { axiosInstance } = useAxios();

const username = ref("");
const password = ref("");
const captcha = ref("");
const captchaImage = ref("");
const captchaUuid = ref("");
const captchaEnabled = ref(false);
const loginError = ref("");

// 获取验证码
const fetchCaptcha = async () => {
  try {
    loginError.value = "";
    const response = await axiosInstance.get("/auth/captcha");
    const { code, data } = response.data;
    if (code === 200) {
      captchaEnabled.value = data.is_enabled;
      captchaImage.value = data.image;
      captchaUuid.value = data.uuid;
      // 清空验证码输入框
      captcha.value = "";
    }
  } catch (error) {
    console.error("Failed to fetch captcha:", error);
    loginError.value = "Failed to load verification code";
  }
};

const handleLogin = async () => {
  // 验证输入
  if (!username.value.trim()) {
    loginError.value = "Please enter username";
    return;
  }
  if (!password.value) {
    loginError.value = "Please enter password";
    return;
  }
  if (captchaEnabled.value && !captcha.value.trim()) {
    loginError.value = "Please enter verification code";
    return;
  }

  try {
    await login(username.value, password.value, captchaUuid.value, captcha.value);
    loginError.value = "";
  } catch (error: any) {
    loginError.value = error.message || "Login failed";
    // 登录失败时刷新验证码
    if (captchaEnabled.value) {
      fetchCaptcha();
    }
  }
};

// 页面加载时获取验证码
onMounted(() => {
  fetchCaptcha();
});
</script>

<template>
  <UiCard class="w-full max-w-sm">
    <UiCardHeader>
      <UiCardTitle class="text-2xl"> Login </UiCardTitle>
      <UiCardDescription>
        Enter your username and password below to log into your account. Not have an account?
        <UiButton
          variant="link"
          class="px-0 text-muted-foreground"
          @click="$router.push('/auth/sign-up')"
        >
          Sign Up
        </UiButton>
      </UiCardDescription>
    </UiCardHeader>
    <UiCardContent class="grid gap-4">
      <div class="grid gap-2">
        <UiLabel for="username"> Username </UiLabel>
        <UiInput
          id="username"
          type="text"
          placeholder="Enter username"
          required
          v-model="username"
        />
      </div>
      <div class="grid gap-2">
        <div class="flex items-center justify-between">
          <UiLabel for="password"> Password </UiLabel>
          <ToForgotPasswordLink />
        </div>
        <UiInput
          id="password"
          type="password"
          required
          placeholder="*********"
          v-model="password"
        />
      </div>

      <!-- 验证码区域 -->
      <div v-if="captchaEnabled" class="grid gap-2">
        <div class="flex items-center justify-between">
          <UiLabel for="captcha"> Verification Code </UiLabel>
          <UiButton
            variant="link"
            size="sm"
            class="px-0 text-muted-foreground text-xs"
            @click="fetchCaptcha"
            :disabled="loading"
          >
            Refresh
          </UiButton>
        </div>
        <div class="flex items-center gap-2">
          <UiInput
            id="captcha"
            type="text"
            placeholder="Enter code"
            required
            v-model="captcha"
            class="flex-1"
            :disabled="loading"
          />
          <div class="w-24 h-10 border rounded overflow-hidden">
            <img
              v-if="captchaImage"
              :src="'data:image/png;base64,' + captchaImage"
              alt="Verification code"
              class="w-full h-full object-cover cursor-pointer"
              @click="fetchCaptcha"
              title="Click to refresh"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-muted">
              <UiSpinner size="sm" />
            </div>
          </div>
        </div>
      </div>

      <!-- 错误信息 -->
      <div
        v-if="loginError"
        class="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive"
      >
        {{ loginError }}
      </div>

      <UiButton class="w-full" @click="handleLogin" :disabled="loading">
        <UiSpinner v-if="loading" class="mr-2" />
        {{ loading ? "Logging in..." : "Login" }}
      </UiButton>

      <UiCardDescription>
        By clicking login, you agree to our
        <TermsOfServiceButton />
        and
        <PrivacyPolicyButton />
      </UiCardDescription>
    </UiCardContent>
  </UiCard>
</template>
