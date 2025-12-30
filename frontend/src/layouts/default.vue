<script setup lang="ts">
import { computed } from 'vue'
import { useCookies } from '@vueuse/integrations/useCookies'
import { storeToRefs } from 'pinia'

import AppSidebar from '@/components/app-sidebar/index.vue'
import CommandMenuPanel from '@/components/command-menu-panel/index.vue'
import ThemePopover from '@/components/custom-theme/theme-popover.vue'
import { useLayoutHeaderProvider } from '@/components/global-layout/layout-header'
import ToggleTheme from '@/components/toggle-theme.vue'
import { SIDEBAR_COOKIE_NAME } from '@/components/ui/sidebar/utils'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/theme'

const defaultOpen = useCookies([SIDEBAR_COOKIE_NAME])
const themeStore = useThemeStore()
const { contentLayout } = storeToRefs(themeStore)

const { state: layoutHeader } = useLayoutHeaderProvider()
const hasLayoutHeader = computed(() => {
  const header = layoutHeader.value
  return Boolean(header.title?.trim() || header.actions)
})
</script>

<template>
  <UiSidebarProvider :default-open="defaultOpen.get(SIDEBAR_COOKIE_NAME)">
    <AppSidebar />
    <UiSidebarInset
      class="w-full max-w-full peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)] peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]"
    >
      <header
        :class="cn(
          'shrink-0 border-b border-border bg-muted/30 transition-[width,height] ease-linear',
          hasLayoutHeader && layoutHeader.sticky ? 'sticky top-0 z-40 bg-background' : '',
        )"
      >
        <div
          :class="cn(
            'flex items-center gap-3 sm:gap-4 min-h-16 p-4',
            contentLayout === 'centered' ? 'container mx-auto ' : '',
          )"
        >
          <UiSidebarTrigger class="-ml-1" />
          <UiSeparator orientation="vertical" class="h-6" />
          <div v-if="hasLayoutHeader" class="flex min-w-0 flex-1 items-center gap-3">
            <div class="min-w-0">
              <h1 class="text-2xl font-bold">
                {{ layoutHeader.title }}
              </h1>
            </div>
            <div class="ml-auto flex items-center gap-2 flex-wrap">
              <component :is="() => layoutHeader.actions?.() ?? null" />
            </div>
          </div>
          <div v-else class="flex-1" />
          <div class="flex items-center space-x-4">
            <CommandMenuPanel />
            <ToggleTheme />
            <ThemePopover />
          </div>
        </div>
      </header>
      <div
        :class="cn(
          'p-4 grow',
          contentLayout === 'centered' ? 'container mx-auto ' : '',
        )"
      >
        <router-view />
      </div>
    </UiSidebarInset>
  </UiSidebarProvider>
</template>
