<script setup lang="ts">
import type { DataTableProps, ServerPagination } from '@/components/data-table/types'

import DataTable from '@/components/data-table/data-table.vue'
import { generateVueTable } from '@/components/data-table/use-generate-vue-table'

import type { OperaLog } from '@/services/api/opera-logs.api'

const props = defineProps<DataTableProps<OperaLog> & {
  serverPagination: ServerPagination
}>()
const table = generateVueTable<OperaLog>(props)
</script>

<template>
  <DataTable :columns :table :data :loading :server-pagination>
    <template #toolbar>
      <slot name="toolbar" :table="table" />
    </template>
  </DataTable>
</template>
