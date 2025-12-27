<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import type { TaskResult } from '@/services/api/task-results.api'

defineProps<{
  result: TaskResult
  onViewDetail: (result: TaskResult) => void
  onDelete: (ids: number[]) => void
}>()
</script>

<template>
  <div class="flex justify-end gap-2">
    <Button size="sm" variant="ghost" @click="onViewDetail(result)"> View Detail </Button>
    <Button size="sm" variant="ghost" class="text-destructive" @click="onDelete([result.id])">
      <Trash2 class="size-4" />
    </Button>
  </div>
</template>
