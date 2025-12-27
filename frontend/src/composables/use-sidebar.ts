import {
  BadgeHelp,
  Boxes,
  Building2,
  LayoutDashboard,
  ListTodo,
  Menu,
  Palette,
  Settings,
  Settings2,
  Shield,
  User,
  Users,
  Wrench,
} from "lucide-vue-next";

import { storeToRefs } from "pinia";

import pinia from "@/plugins/pinia/setup";
import router from "@/router";
import { useGetSidebarMenuQuery, type SidebarMenuNode } from "@/services/api/menus.api";
import { useGetCurrentUserQuery } from "@/services/api/user.api";
import { useAuthStore } from "@/stores/auth";

import type { NavGroup, NavItem, Team, User as SidebarUser } from "@/components/app-sidebar/types";

export function useSidebar() {
  const settingsNavItems = [
    { title: "Profile", url: "/settings/", icon: User },
    { title: "Account", url: "/settings/account", icon: Wrench },
    { title: "Appearance", url: "/settings/appearance", icon: Palette },
  ];

  const authStore = useAuthStore(pinia);
  const { userInfo } = storeToRefs(authStore);
  const { accessToken } = storeToRefs(authStore);
  const hasToken = computed(() => Boolean(accessToken.value));
  const menuQuery = useGetSidebarMenuQuery(hasToken);
  const userQuery = useGetCurrentUserQuery(hasToken);

  const otherPages = ref<NavGroup[]>([]);

  const routePathSet = computed(() => new Set(router.getRoutes().map((route) => route.path)));

  function resolveIcon(value?: string | null, hint?: string) {
    const iconValue = `${value || ""} ${hint || ""}`.toLowerCase();
    if (iconValue.includes("dashboard")) return LayoutDashboard;
    if (iconValue.includes("task")) return ListTodo;
    if (iconValue.includes("app")) return Boxes;
    if (iconValue.includes("user") || iconValue.includes("account")) return Users;
    if (iconValue.includes("menu")) return Menu;
    if (iconValue.includes("dept") || iconValue.includes("department")) return Building2;
    if (iconValue.includes("role") || iconValue.includes("permission")) return Shield;
    if (iconValue.includes("config") || iconValue.includes("setting")) return Settings2;
    if (iconValue.includes("profile")) return User;
    if (iconValue.includes("appearance")) return Palette;
    if (iconValue.includes("help")) return BadgeHelp;
    return undefined;
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

  const teams = ref<Team[]>([
    {
      name: "Acme Inc",
      logo: Settings,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: LayoutDashboard,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Menu,
      plan: "Free",
    },
  ]);

  return {
    navData,
    user,
    teams,
    otherPages,
    settingsNavItems,
  };
}
