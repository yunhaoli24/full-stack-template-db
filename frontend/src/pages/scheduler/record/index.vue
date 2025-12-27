<script setup lang="ts">
import { isAxiosError } from 'axios'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import ConfirmDialog from '@/components/confirm-dialog.vue'
import { BasicPage } from '@/components/global-layout'
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from '@/constants/pagination'
import {
  useDeleteTaskResultsMutation,
  useGetTaskResultsQuery,
  type TaskResult,
} from '@/services/api/task-results.api'

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

function handlePageSizeChange(value: string | number) {
  const newSize = Number(value)
  if (newSize) {
    pageSize.value = newSize
    page.value = 1
    selectedIds.value.clear()
  }
}

function goToFirstPage() {
  page.value = 1
  selectedIds.value.clear()
}

function goToPreviousPage() {
  if (page.value > 1) {
    page.value--
    selectedIds.value.clear()
  }
}

function goToNextPage() {
  if (page.value < totalPages.value) {
    page.value++
    selectedIds.value.clear()
  }
}

function goToLastPage() {
  page.value = totalPages.value
  selectedIds.value.clear()
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

        <UiTable>
          <UiTableHeader>
            <UiTableRow>
              <UiTableHead class="w-12">
                <UiCheckbox
                  :checked="selectedIds.size === results.length && results.length > 0"
                  @update:checked="toggleSelectAll"
                />
              </UiTableHead>
              <UiTableHead>Task ID</UiTableHead>
              <UiTableHead>Name</UiTableHead>
              <UiTableHead>Status</UiTableHead>
              <UiTableHead>Worker</UiTableHead>
              <UiTableHead>Queue</UiTableHead>
              <UiTableHead>Retries</UiTableHead>
              <UiTableHead>Completed Time</UiTableHead>
              <UiTableHead class="text-right">Actions</UiTableHead>
            </UiTableRow>
          </UiTableHeader>
          <UiTableBody>
            <UiTableRow v-for="item in results" :key="item.id">
              <UiTableCell>
                <UiCheckbox
                  :checked="selectedIds.has(item.id)"
                  @update:checked="toggleSelect(item.id)"
                />
              </UiTableCell>
              <UiTableCell class="font-mono text-xs">{{ item.task_id }}</UiTableCell>
              <UiTableCell>{{ item.name || '-' }}</UiTableCell>
              <UiTableCell>
                <UiBadge :variant="getStatusVariant(item.status)">
                  {{ item.status }}
                </UiBadge>
              </UiTableCell>
              <UiTableCell>{{ item.worker || '-' }}</UiTableCell>
              <UiTableCell>{{ item.queue || '-' }}</UiTableCell>
              <UiTableCell>{{ item.retries ?? 0 }}</UiTableCell>
              <UiTableCell>{{ formatDate(item.date_done) }}</UiTableCell>
              <UiTableCell class="text-right space-x-2">
                <UiButton size="sm" variant="ghost" @click="showDetail(item)">
                  View Detail
                </UiButton>
                <UiButton
                  size="sm"
                  variant="ghost"
                  class="text-destructive"
                  @click="requestDelete([item.id])"
                >
                  <Trash2 class="size-4" />
                </UiButton>
              </UiTableCell>
            </UiTableRow>
            <UiTableEmpty v-if="!results.length" :colspan="9"> No task records found. </UiTableEmpty>
          </UiTableBody>
        </UiTable>

        <div v-if="totalPages > 0" class="flex items-center justify-between px-2 py-4">
          <div class="text-sm text-muted-foreground">
            Showing {{ ((page - 1) * pageSize) + 1 }} to {{ Math.min(page * pageSize, total) }} of
            {{ total }} results
          </div>
          <div class="flex items-center space-x-6 lg:space-x-8">
            <div class="flex items-center space-x-2">
              <p class="hidden text-sm font-medium line-clamp-1 md:block">Rows per page</p>
              <UiSelect :model-value="`${pageSize}`" @update:model-value="handlePageSizeChange">
                <UiSelectTrigger class="h-8 w-[70px]">
                  <UiSelectValue :placeholder="`${pageSize}`" />
                </UiSelectTrigger>
                <UiSelectContent side="top">
                  <UiSelectItem v-for="size in PAGE_SIZES" :key="size" :value="`${size}`">
                    {{ size }}
                  </UiSelectItem>
                </UiSelectContent>
              </UiSelect>
            </div>
            <div class="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {{ page }} of {{ totalPages }}
            </div>
            <div class="flex items-center space-x-2">
              <UiButton
                variant="outline"
                class="hidden size-8 p-0 lg:flex"
                :disabled="page <= 1"
                @click="goToFirstPage"
              >
                <span class="sr-only">Go to first page</span>
                <ChevronsLeft class="size-4" />
              </UiButton>
              <UiButton
                variant="outline"
                class="size-8 p-0"
                :disabled="page <= 1"
                @click="goToPreviousPage"
              >
                <span class="sr-only">Go to previous page</span>
                <ChevronLeft class="size-4" />
              </UiButton>
              <UiButton
                variant="outline"
                class="size-8 p-0"
                :disabled="page >= totalPages"
                @click="goToNextPage"
              >
                <span class="sr-only">Go to next page</span>
                <ChevronRight class="size-4" />
              </UiButton>
              <UiButton
                variant="outline"
                class="hidden size-8 p-0 lg:flex"
                :disabled="page >= totalPages"
                @click="goToLastPage"
              >
                <span class="sr-only">Go to last page</span>
                <ChevronsRight class="size-4" />
              </UiButton>
            </div>
          </div>
        </div>
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
