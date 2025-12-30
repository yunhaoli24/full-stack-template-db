<script lang="ts" setup>
import { onBeforeUnmount, useSlots, watchEffect } from 'vue'

import { useLayoutHeader } from './layout-header'
import type { LayoutHeaderProps } from './types'

const props = defineProps<LayoutHeaderProps>()
const slots = useSlots()

const { setHeader, clearHeader } = useLayoutHeader()

watchEffect(() => {
  setHeader({
    title: props.title,
    sticky: props.sticky,
    actions: slots.actions,
  })
})

onBeforeUnmount(() => {
  clearHeader()
})
</script>

<template>
  <main class="py-4">
    <slot />
  </main>
</template>
