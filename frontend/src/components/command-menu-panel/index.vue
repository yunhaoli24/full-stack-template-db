<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { MenuIcon, SearchIcon } from "lucide-vue-next";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import CommandChangeTheme from "./command-change-theme.vue";
import CommandToPage from "./command-to-page.vue";

const open = ref(false);

useEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    handleOpenChange();
  }
});

function handleOpenChange() {
  open.value = !open.value;
}

const firstKey = computed(() => (navigator?.userAgent.includes("Mac OS") ? "⌘" : "Ctrl"));
</script>

<template>
  <div>
    <UiButton variant="outline" size="icon" @click="handleOpenChange">
      <SearchIcon />
      <span class="sr-only">Search menu ({{ firstKey }} + k)</span>
    </UiButton>

    <UiCommandDialog v-model:open="open">
      <UiCommandInput placeholder="Type a command or search..." />
      <UiCommandList>
        <UiCommandEmpty>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MenuIcon />
              </EmptyMedia>
              <EmptyTitle>No menu found.</EmptyTitle>
              <EmptyDescription>
                Try searching for a command or check the spelling.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </UiCommandEmpty>

        <CommandToPage @click="handleOpenChange" />
        <UiCommandSeparator />
        <CommandChangeTheme @click="handleOpenChange" />
      </UiCommandList>
    </UiCommandDialog>
  </div>
</template>
