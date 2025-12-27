<script setup lang="ts">
import { KeyRound, Pencil, Trash2 } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import type { UserDetail } from '@/services/api/user.api'

defineProps<{
  user: UserDetail
  onEdit: (user: UserDetail) => void
  onDelete: (user: UserDetail) => void
  onResetPassword: (user: UserDetail) => void
}>()
</script>

<template>
  <div class="flex justify-end gap-2">
    <Button size="sm" variant="ghost" @click="onResetPassword(user)">
      <KeyRound class="mr-1 size-4" />
      Password
    </Button>
    <Button size="sm" variant="ghost" @click="onEdit(user)">
      <Pencil class="mr-1 size-4" />
      Edit
    </Button>
    <Button size="sm" variant="ghost" class="text-destructive" @click="onDelete(user)">
      <Trash2 class="mr-1 size-4" />
      Delete
    </Button>
  </div>
</template>
