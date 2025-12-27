<script setup lang="ts">
import { isAxiosError } from 'axios'
import { Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import type { ServerPagination } from '@/components/data-table/types'
import ConfirmDialog from '@/components/confirm-dialog.vue'
import { BasicPage } from '@/components/global-layout'
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from '@/constants/pagination'
import {
  useDeleteTaskResultsMutation,
  useGetTaskResultsQuery,
  type TaskResult,
} from '@/services/api/task-results.api'

import { createColumns } from './components/columns'
import RecordDataTable from './components/data-table.vue'

const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const searchName = ref('')
const searchTaskId = ref('')

const query = useGetTaskResultsQuery(
  computed(() => ({
    page: page.value,
    size: pageSize.value,
    name: searchName.value || undefined,
    task_id: searchTaskId.value || undefined,
  })),
)
const deleteMutation = useDeleteTaskResultsMutation()

const deleteDialogOpen = ref(false)
const deleteTargets = ref<number[]>([])
const selectedIds = ref<Set<number>>(new Set())

const isDeleting = computed(() => deleteMutation.isPending.value)

const results = computed(() => query.data.value?.data?.items ?? [])
const total = computed(() => query.data.value?.data?.total ?? 0)
const totalPages = computed(() => query.data.value?.data?.total_pages ?? 0)
const isLoading = computed(() => query.isLoading.value)

const serverPagination = computed<ServerPagination>(() => ({
  page: page.value,
  pageSize: pageSize.value,
  total: total.value,
  onPageChange: nextPage => {
    page.value = nextPage
    selectedIds.value.clear()
  },
  onPageSizeChange: nextSize => {
    pageSize.value = nextSize
    page.value = 1
    selectedIds.value.clear()
  },
}))

const columns = computed(() =>
  createColumns({
    selectedIds: selectedIds.value,
    onSelect: (id: number) => toggleSelect(id),
    onSelectAll: () => toggleSelectAll(),
    onViewDetail: (result: TaskResult) => showDetail(result),
    onDelete: (ids: number[]) => requestDelete(ids),
  }),
)

function getErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    return error.response?.data?.msg || error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Request failed'
}

function getStatusVariant(status: string) {
  switch (status.toLowerCase()) {
    case 'success':
      return 'default'
    case 'failure':
    case 'error':
      return 'destructive'
    case 'pending':
      return 'secondary'
    default:
      return 'outline'
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr)
    return '-'
  return new Date(dateStr).toLocaleString()
}

function formatData(data: unknown) {
  if (data === null || data === undefined)
    return '-'
  try {
    return JSON.stringify(data, null, 2)
  }
  catch {
    return String(data)
  }
}

function handleSearch() {
  page.value = 1
}

function toggleSelect(id: number) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  }
  else {
    selectedIds.value.add(id)
  }
}

function toggleSelectAll() {
  if (selectedIds.value.size === results.value.length) {
    selectedIds.value.clear()
  }
  else {
    selectedIds.value = new Set(results.value.map(r => r.id))
  }
}

function requestDelete(ids: number[]) {
  deleteTargets.value = ids
  deleteDialogOpen.value = true
}

function requestDeleteSelected() {
  if (selectedIds.value.size === 0) {
    toast.error('Please select at least one record')
    return
  }
  requestDelete(Array.from(selectedIds.value))
}

async function handleDeleteConfirm() {
  if (!deleteTargets.value.length) {
    return
  }
  try {
    await deleteMutation.mutateAsync(deleteTargets.value)
    toast.success(`${deleteTargets.value.length} record(s) deleted`)
    selectedIds.value.clear()
  }
  catch (error) {
    toast.error(getErrorMessage(error))
  }
  finally {
    deleteDialogOpen.value = false
    deleteTargets.value = []
  }
}

const detailDialogOpen = ref(false)
const selectedResult = ref<TaskResult | null>(null)

function showDetail(result: TaskResult) {
  selectedResult.value = result
  detailDialogOpen.value = true
}
</script>

<template>
  <BasicPage
    title="Task Execution Records"
    description="View task execution history and results."
    sticky
  >
    <template #actions>
      <UiButton v-if="selectedIds.size > 0" variant="destructive" @click="requestDeleteSelected">
        <Trash2 class="mr-2 size-4" />
        Delete Selected ({{ selectedIds.size }})
      </UiButton>
    </template>

    <UiCard>
      <UiCardContent class="py-4">
        <div class="mb-4 flex gap-4">
          <UiInput
            v-model="searchName"
            placeholder="Search by name"
            class="max-w-xs"
            @keyup.enter="handleSearch"
          />
          <UiInput
            v-model="searchTaskId"
            placeholder="Search by task ID"
            class="max-w-xs"
            @keyup.enter="handleSearch"
          />
          <UiButton @click="handleSearch"> Search </UiButton>
        </div>

        <RecordDataTable
          :data="results"
          :columns="columns"
          :loading="isLoading"
          :server-pagination="serverPagination"
        />
      </UiCardContent>
    </UiCard>

    <UiDialog v-model:open="detailDialogOpen">
      <UiDialogContent class="max-h-[90vh] overflow-y-auto max-w-3xl">
        <UiDialogHeader>
          <UiDialogTitle>Task Execution Detail</UiDialogTitle>
          <UiDialogDescription>
            Detailed information about the task execution.
          </UiDialogDescription>
        </UiDialogHeader>

        <div v-if="selectedResult" class="space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <div class="text-sm font-medium text-muted-foreground">Task ID</div>
              <div class="font-mono text-sm">{{ selectedResult.task_id }}</div>
            </div>
            <div>
              <div class="text-sm font-medium text-muted-foreground">Name</div>
              <div class="text-sm">{{ selectedResult.name || '-' }}</div>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <div class="text-sm font-medium text-muted-foreground">Status</div>
              <div>
                <UiBadge :variant="getStatusVariant(selectedResult.status)">
                  {{ selectedResult.status }}
                </UiBadge>
              </div>
            </div>
            <div>
              <div class="text-sm font-medium text-muted-foreground">Worker</div>
              <div class="text-sm">{{ selectedResult.worker || '-' }}</div>
            </div>
            <div>
              <div class="text-sm font-medium text-muted-foreground">Queue</div>
              <div class="text-sm">{{ selectedResult.queue || '-' }}</div>
            </div>
          </div>

          <div>
            <div class="text-sm font-medium text-muted-foreground">Completed Time</div>
            <div class="text-sm">{{ formatDate(selectedResult.date_done) }}</div>
          </div>

          <div v-if="selectedResult.args">
            <div class="text-sm font-medium text-muted-foreground">Args</div>
            <UiScrollArea class="h-24 w-full rounded-md border p-4">
              <pre class="text-xs">{{ formatData(selectedResult.args) }}</pre>
            </UiScrollArea>
          </div>

          <div v-if="selectedResult.kwargs">
            <div class="text-sm font-medium text-muted-foreground">Kwargs</div>
            <UiScrollArea class="h-24 w-full rounded-md border p-4">
              <pre class="text-xs">{{ formatData(selectedResult.kwargs) }}</pre>
            </UiScrollArea>
          </div>

          <div v-if="selectedResult.result">
            <div class="text-sm font-medium text-muted-foreground">Result</div>
            <UiScrollArea class="h-32 w-full rounded-md border p-4">
              <pre class="text-xs">{{ formatData(selectedResult.result) }}</pre>
            </UiScrollArea>
          </div>

          <div v-if="selectedResult.traceback">
            <div class="text-sm font-medium text-muted-foreground">Traceback</div>
            <UiScrollArea class="h-48 w-full rounded-md border p-4 bg-destructive/10">
              <pre class="text-xs">{{ selectedResult.traceback }}</pre>
            </UiScrollArea>
          </div>
        </div>

        <UiDialogFooter>
          <UiButton type="button" variant="outline" @click="detailDialogOpen = false">
            Close
          </UiButton>
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>

    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      :is-loading="isDeleting"
      destructive
      :confirm-button-text="`Delete ${deleteTargets.length} Record(s)`"
      @confirm="handleDeleteConfirm"
    >
      <template #title> Delete task records </template>
      <template #description>
        This action cannot be undone. {{ deleteTargets.length }} record(s) will be permanently
        removed.
      </template>
    </ConfirmDialog>
  </BasicPage>
</template>
