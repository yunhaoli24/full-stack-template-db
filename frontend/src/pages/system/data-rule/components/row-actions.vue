<script setup lang="ts">
import { Pencil, Trash2 } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import type { DataRuleDetail } from '@/services/api/system/data-rule/data-rules.api'

defineProps<{
  rule: DataRuleDetail
  onEdit: (rule: DataRuleDetail) => void
  onDelete: (rule: DataRuleDetail) => void
}>()
</script>

<template>
  <div class="flex justify-end gap-2">
    <Button size="sm" variant="ghost" @click="onEdit(rule)">
      <Pencil class="mr-1 size-4" />
      Edit
    </Button>
    <Button size="sm" variant="ghost" class="text-destructive" @click="onDelete(rule)">
      <Trash2 class="mr-1 size-4" />
      Delete
    </Button>
  </div>
</template>
