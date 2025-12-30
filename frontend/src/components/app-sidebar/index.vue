<script lang="ts" setup>
import { useDark } from '@vueuse/core'

import { useSidebar } from '@/composables/use-sidebar'

import NavFooter from './nav-footer.vue'
import NavTeam from './nav-team.vue'

const { navData, user } = useSidebar()
const navMain = computed(() => navData.value || [])
const isDark = useDark()
</script>

<template>
  <UiSidebar collapsible="icon" class="z-50">
    <UiSidebarHeader>
      <div class="flex items-center gap-2 px-2 py-2">
        <img :src="isDark ? '/logo.svg' : '/logo-black.svg'" alt="Logo" class="size-8 shrink-0" />
        <div class="grid flex-1 text-sm leading-tight">
          <span class="font-semibold truncate">后台管理系统</span>
        </div>
      </div>
    </UiSidebarHeader>

    <UiSidebarContent>
      <NavTeam :nav-main="navMain" />
    </UiSidebarContent>

    <UiSidebarFooter>
      <NavFooter :user="user" />
    </UiSidebarFooter>

    <UiSidebarRail />
  </UiSidebar>
</template>
