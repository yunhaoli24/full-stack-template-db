import type { Router } from "vue-router";

import { storeToRefs } from "pinia";

import pinia from "@/plugins/pinia/setup";
import { useAuthStore } from "@/stores/auth";

// Public routes that don't require authentication
const publicRoutes = [
  /^\/auth/, // All auth routes (login, register, etc.)
  /^\/errors/, // All error pages (404, 500, etc.)
];

function isPublicRoute(path: string): boolean {
  return publicRoutes.some((pattern) => pattern.test(path));
}

export function authGuard(router: Router) {
  router.beforeEach((to, _from) => {
    const authStore = useAuthStore(pinia);
    const { isLogin } = storeToRefs(authStore);

    // If the route is not public and user is not logged in, redirect to login
    if (!isPublicRoute(to.path) && !unref(isLogin)) {
      return {
        name: "/auth/sign-in",
        query: { redirect: to.fullPath },
      };
    }
  });
}
