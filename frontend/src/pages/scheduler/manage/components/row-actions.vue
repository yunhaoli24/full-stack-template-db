<script setup lang="ts">
import { Pencil, Play, Power, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import type { TaskScheduler } from '@/services/api/scheduler/manage/schedulers.api'
defineProps<{
  scheduler: TaskScheduler
  onEdit: (scheduler: TaskScheduler) => void
  onDelete: (scheduler: TaskScheduler) => void
  onToggleStatus: (scheduler: TaskScheduler) => void
  onExecute: (scheduler: TaskScheduler) => void
}>()
</script>
<template>
  <div class="flex justify-end gap-2">
    <Button size="sm" variant="ghost" @click="onExecute(scheduler)">
      <Play class="mr-1 size-4" />
      Execute
    </Button>
    <Button size="sm" variant="ghost" @click="onToggleStatus(scheduler)">
      <Power class="mr-1 size-4" />
      {{ scheduler.status === 1 ? 'Disable' : 'Enable' }}
    </Button>
    <Button size="sm" variant="ghost" @click="onEdit(scheduler)">
      <Pencil class="mr-1 size-4" />
      Edit
    </Button>
    <Button size="sm" variant="ghost" class="text-destructive" @click="onDelete(scheduler)">
      <Trash2 class="mr-1 size-4" />
      Delete
    </Button>
  </div>
</template>
