<script lang="ts" setup>
import { Icon } from '@iconify/vue'

import { useSidebar } from '@/components/ui/sidebar'

import type { NavGroup, NavItem } from './types'

const { navMain } = defineProps<{
  navMain: NavGroup[]
}>()

const route = useRoute()

const { state, isMobile } = useSidebar()

function isCollapsed(menu: NavItem): boolean {
  const pathname = route.path
  navMain.forEach((group) => {
    group.items.forEach((item) => {
      if (item.url === pathname) {
        return true
      }
    })
  })
  return !!menu.items?.some(item => item.url === pathname)
}

function isActive(menu: NavItem): boolean {
  const pathname = route.path
  if (menu.url) {
    return pathname === menu.url && !menu.external
  }
  return !!menu.items?.some(item => item.url === pathname)
}
</script>

<template>
  <UiSidebarGroup v-for="group in navMain" :key="group.title">
    <UiSidebarGroupLabel>{{ group.title }}</UiSidebarGroupLabel>
    <UiSidebarMenu>
      <template v-for="menu in group.items" :key="menu.title">
        <UiSidebarMenuItem v-if="!menu.items">
          <UiSidebarMenuButton as-child :is-active="isActive(menu)" :tooltip="menu.title">
            <router-link v-if="!menu.external" :to="menu.url">
              <Icon v-if="menu.icon" :icon="menu.icon" class="size-4" />
              <span>{{ menu.title }}</span>
            </router-link>
            <a v-else :href="menu.url" target="_blank" rel="noreferrer">
              <Icon v-if="menu.icon" :icon="menu.icon" class="size-4" />
              <span>{{ menu.title }}</span>
            </a>
          </UiSidebarMenuButton>
        </UiSidebarMenuItem>

        <UiSidebarMenuItem v-else>
          <!-- sidebar expanded -->
          <UiCollapsible
            v-if="state !== 'collapsed' || isMobile"
            as-child
            :default-open="isCollapsed(menu)"
            class="group/collapsible"
          >
            <UiSidebarMenuItem>
              <UiCollapsibleTrigger as-child>
                <UiSidebarMenuButton :tooltip="menu.title">
                  <Icon v-if="menu.icon" :icon="menu.icon" class="size-4" />
                  <span>{{ menu.title }}</span>
                  <Icon
                    icon="lucide:chevron-right"
                    class="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                  />
                </UiSidebarMenuButton>
              </UiCollapsibleTrigger>
            </UiSidebarMenuItem>
            <UiCollapsibleContent>
              <UiSidebarMenuSub>
                <UiSidebarMenuSubItem v-for="subItem in menu.items" :key="subItem.title">
                  <UiSidebarMenuSubButton as-child :is-active="isActive(subItem as NavItem)">
                    <router-link v-if="!subItem.external" :to="subItem?.url || '/'">
                      <Icon v-if="subItem.icon" :icon="subItem.icon" class="size-4" />
                      <span>{{ subItem.title }}</span>
                    </router-link>
                    <a v-else :href="subItem?.url" target="_blank" rel="noreferrer">
                      <Icon v-if="subItem.icon" :icon="subItem.icon" class="size-4" />
                      <span>{{ subItem.title }}</span>
                    </a>
                  </UiSidebarMenuSubButton>
                </UiSidebarMenuSubItem>
              </UiSidebarMenuSub>
            </UiCollapsibleContent>
          </UiCollapsible>

          <!-- sidebar collapsed -->
          <UiDropdownMenu v-else>
            <UiDropdownMenuTrigger as-child>
              <UiSidebarMenuButton :tooltip="menu.title">
                <Icon v-if="menu.icon" :icon="menu.icon" class="size-4" />
                <span>{{ menu.title }}</span>
              </UiSidebarMenuButton>
            </UiDropdownMenuTrigger>
            <UiDropdownMenuContent align="start" side="right">
              <UiDropdownMenuLabel>{{ menu.title }}</UiDropdownMenuLabel>
              <UiDropdownMenuSeparator />
              <UiDropdownMenuItem v-for="subItem in menu.items" :key="subItem.title" as-child>
                <router-link v-if="!subItem.external" :to="subItem?.url || '/'">
                  <Icon v-if="subItem.icon" :icon="subItem.icon" class="size-4" />
                  <span>{{ subItem.title }}</span>
                </router-link>
                <a v-else :href="subItem?.url" target="_blank" rel="noreferrer">
                  <Icon v-if="subItem.icon" :icon="subItem.icon" class="size-4" />
                  <span>{{ subItem.title }}</span>
                </a>
              </UiDropdownMenuItem>
            </UiDropdownMenuContent>
          </UiDropdownMenu>
        </UiSidebarMenuItem>
      </template>
    </UiSidebarMenu>
  </UiSidebarGroup>
</template>
