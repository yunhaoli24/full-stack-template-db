type NavIcon = string;

interface BaseNavItem {
  title: string;
  icon?: NavIcon;
  external?: boolean;
}

export type NavItem =
  | (BaseNavItem & {
      items: (BaseNavItem & { url?: string })[];
      url?: never;
      isActive?: boolean;
    })
  | (BaseNavItem & {
      url: string;
      items?: never;
    });

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface User {
  name: string;
  avatar: string;
  email: string;
}

export interface SidebarData {
  user: User;
  navMain: NavGroup[];
}
