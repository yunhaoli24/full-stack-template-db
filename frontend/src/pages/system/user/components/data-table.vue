<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table/types'

import DataTable from '@/components/data-table/data-table.vue'
import { generateVueTable } from '@/components/data-table/use-generate-vue-table'

import type { UserDetail } from '@/services/api/system/user/user.api'

const props = defineProps<DataTableProps<UserDetail>>()
const table = generateVueTable<UserDetail>(props)
</script>

<template>
  <DataTable :columns :table :data :loading>
    <template #toolbar>
      <slot name="toolbar" :table="table" />
    </template>
  </DataTable>
</template>
