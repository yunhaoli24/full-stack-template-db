import { storeToRefs } from "pinia";

import pinia from "@/plugins/pinia/setup";
import router from "@/router";
import { useGetSidebarMenuQuery, type SidebarMenuNode } from "@/services/api/system/menu/menus.api";
import { useGetCurrentUserQuery } from "@/services/api/system/user/user.api";
import { useAuthStore } from "@/stores/auth";

import type { NavGroup, NavItem, User as SidebarUser } from "@/components/app-sidebar/types";

export function useSidebar() {
  const settingsNavItems = [
    { title: "Profile", url: "/settings/", icon: "lucide:user" },
    { title: "Account", url: "/settings/account", icon: "lucide:wrench" },
    { title: "Appearance", url: "/settings/appearance", icon: "lucide:palette" },
  ];

  const authStore = useAuthStore(pinia);
  const { userInfo } = storeToRefs(authStore);
  const { accessToken } = storeToRefs(authStore);
  const hasToken = computed(() => Boolean(accessToken.value));
  const menuQuery = useGetSidebarMenuQuery(hasToken);
  const userQuery = useGetCurrentUserQuery(hasToken);

  const otherPages = ref<NavGroup[]>([]);

  const routePathSet = computed(() => new Set(router.getRoutes().map((route) => route.path)));

  function resolveIcon(value?: string | null): string | null {
    return value || null;
  }

  function isVisibleMenu(node: SidebarMenuNode) {
    if (node.type === 2) {
      return false;
    }
    if (node.status === 0 || node.display === 0) {
      return false;
    }
    if (node.meta?.hideInMenu) {
      return false;
    }
    return true;
  }

  function mapMenuNodes(nodes: SidebarMenuNode[], depth = 0): NavItem[] {
    const items: NavItem[] = [];
    nodes.forEach((node) => {
      if (!isVisibleMenu(node)) {
        return;
      }

      const title = node.meta?.title || node.name;
      const icon = resolveIcon(node.meta?.icon, node.path || node.name || node.meta?.title);
      const childItems = node.children ? mapMenuNodes(node.children, depth + 1) : [];
      if (childItems.length) {
        if (depth >= 1) {
          items.push(...childItems);
          return;
        }
        items.push({ title, icon, items: childItems });
        return;
      }

      const externalUrl = node.meta?.link || node.meta?.iframeSrc || "";
      const url = node.path || externalUrl || "";
      if (!url) {
        return;
      }

      const isExternal = Boolean(externalUrl && !routePathSet.value.has(url));
      if (!isExternal && !routePathSet.value.has(url)) {
        return;
      }

      items.push({
        title,
        icon,
        url: isExternal ? externalUrl : url,
        external: isExternal,
      });
    });
    return items;
  }

  const navData = computed<NavGroup[]>(() => {
    const sidebarMenus = menuQuery.data.value?.data ?? [];
    const items = mapMenuNodes(sidebarMenus);
    if (!items.length) {
      return [];
    }
    return [
      {
        title: "Menu",
        items,
      },
    ];
  });

  const user = computed<SidebarUser>(() => {
    const current = userQuery.data.value?.data ?? userInfo.value ?? {};
    return {
      name: current.nickname || current.username || "User",
      email: current.email || "",
      avatar: current.avatar || "/avatars/shadcn.jpg",
    };
  });

  return {
    navData,
    user,
    otherPages,
    settingsNavItems,
  };
}
