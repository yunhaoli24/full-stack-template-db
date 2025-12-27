<script setup lang="ts">
import { Pencil, Trash2 } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import type { RoleDetail } from '@/services/api/roles.api'

defineProps<{
  role: RoleDetail
  onEdit: (role: RoleDetail) => void
  onDelete: (role: RoleDetail) => void
}>()
</script>

<template>
  <div class="flex justify-end gap-2">
    <Button size="sm" variant="ghost" @click="onEdit(role)">
      <Pencil class="mr-1 size-4" />
      Edit
    </Button>
    <Button size="sm" variant="ghost" class="text-destructive" @click="onDelete(role)">
      <Trash2 class="mr-1 size-4" />
      Delete
    </Button>
  </div>
</template>
