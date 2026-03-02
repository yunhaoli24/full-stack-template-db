<script setup lang="ts">
import { computed } from "vue";

import { useSidebar } from "@/composables/use-sidebar";

import type { NavGroup, NavItem } from "../app-sidebar/types";

import CommandItemHasIcon from "./command-item-has-icon.vue";

const emit = defineEmits<{
  (e: "click"): void;
}>();

const { navData, otherPages } = useSidebar();

function getFlatNavItems(navData: NavGroup[]): NavItem[] {
  const flatItems: NavItem[] = [];
  navData.forEach((group) => {
    group.items.forEach((item) => {
      if (item.items) {
        flatItems.push(...getFlatNavItems([item as unknown as NavGroup]));
      } else {
        flatItems.push(item);
      }
    });
  });
  return flatItems;
}

const commands = computed(() =>
  getFlatNavItems([...(navData.value || []), ...(otherPages.value || [])]),
);

const router = useRouter();
const route = useRoute();
function commandItemClick(url: string, external?: boolean) {
  emit("click");
  if (external) {
    window.open(url, "_blank", "noreferrer");
    return;
  }
  if (route.fullPath !== url) {
    router.push(url);
  }
}
</script>

<template>
  <UiCommandGroup heading="Pages">
    <UiCommandItem
      v-for="command in commands"
      :key="command.title"
      :value="command.title"
      @click="commandItemClick(command.url!, command.external)"
    >
      <CommandItemHasIcon :name="command.title" :icon="command.icon" />
    </UiCommandItem>
  </UiCommandGroup>
</template>
