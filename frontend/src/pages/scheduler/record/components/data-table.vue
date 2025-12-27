<script setup lang="ts">
import type { DataTableProps, ServerPagination } from '@/components/data-table/types'

import DataTable from '@/components/data-table/data-table.vue'
import { generateVueTable } from '@/components/data-table/use-generate-vue-table'

import type { TaskResult } from '@/services/api/task-results.api'

const props = defineProps<DataTableProps<TaskResult> & {
  serverPagination: ServerPagination
}>()
const table = generateVueTable<TaskResult>(props)
</script>

<template>
  <DataTable :columns :table :data :loading :server-pagination>
    <template #toolbar>
      <slot name="toolbar" :table="table" />
    </template>
  </DataTable>
</template>
