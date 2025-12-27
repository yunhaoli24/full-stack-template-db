<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table/types'
import DataTable from '@/components/data-table/data-table.vue'
import { generateVueTable } from '@/components/data-table/use-generate-vue-table'
import type { TaskScheduler } from '@/services/api/scheduler/manage/schedulers.api'
const props = defineProps<DataTableProps<TaskScheduler>>()
const table = generateVueTable<TaskScheduler>(props)
</script>
<template>
  <DataTable :columns :table :data :loading>
    <template #toolbar>
      <slot name="toolbar" :table="table" />
    </template>
  </DataTable>
</template>
