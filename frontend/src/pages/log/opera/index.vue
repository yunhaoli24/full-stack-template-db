<script setup lang="ts">
import { isAxiosError } from 'axios'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import ConfirmDialog from '@/components/confirm-dialog.vue'
import { BasicPage } from '@/components/global-layout'
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from '@/constants/pagination'
import {
  useDeleteAllOperaLogsMutation,
  useDeleteOperaLogsMutation,
  useGetOperaLogsQuery,
  type OperaLog,
} from '@/services/api/opera-logs.api'

const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const searchUsername = ref('')
const searchStatus = ref<number | undefined>(undefined)
const searchIp = ref('')

const query = useGetOperaLogsQuery(
  computed(() => ({
    page: page.value,
    size: pageSize.value,
    username: searchUsername.value || undefined,
    status: searchStatus.value,
    ip: searchIp.value || undefined,
  })),
)
const deleteMutation = useDeleteOperaLogsMutation()
const deleteAllMutation = useDeleteAllOperaLogsMutation()

const deleteDialogOpen = ref(false)
const deleteAllDialogOpen = ref(false)
const deleteTargets = ref<number[]>([])
const selectedIds = ref<Set<number>>(new Set())

const isDeleting = computed(() => deleteMutation.isPending.value || deleteAllMutation.isPending.value)

const logs = computed(() => query.data.value?.data?.items ?? [])
const total = computed(() => query.data.value?.data?.total ?? 0)
const totalPages = computed(() => query.data.value?.data?.total_pages ?? 0)

const statusOptions = [
  { label: 'All', value: undefined },
  { label: 'Success', value: 1 },
  { label: 'Failed', value: 0 },
] as const

function getErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    return error.response?.data?.msg || error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Request failed'
}

function getStatusVariant(status: number) {
  return status === 1 ? 'default' : 'destructive'
}

function getStatusText(status: number) {
  return status === 1 ? 'Success' : 'Failed'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString()
}

function getLocation(log: OperaLog) {
  const parts = [log.country, log.region, log.city].filter(Boolean)
  return parts.length > 0 ? parts.join(' - ') : '-'
}

function formatCostTime(time: number) {
  return `${time.toFixed(2)}ms`
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
  if (selectedIds.value.size === logs.value.length) {
    selectedIds.value.clear()
  }
  else {
    selectedIds.value = new Set(logs.value.map(l => l.id))
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

function requestDeleteAll() {
  deleteAllDialogOpen.value = true
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

async function handleDeleteAllConfirm() {
  try {
    await deleteAllMutation.mutateAsync()
    toast.success('All operation logs deleted')
    selectedIds.value.clear()
  }
  catch (error) {
    toast.error(getErrorMessage(error))
  }
  finally {
    deleteAllDialogOpen.value = false
  }
}

const detailDialogOpen = ref(false)
const selectedLog = ref<OperaLog | null>(null)

function showDetail(log: OperaLog) {
  selectedLog.value = log
  detailDialogOpen.value = true
}

function formatData(data: Record<string, unknown> | null) {
  if (!data)
    return '-'
  try {
    return JSON.stringify(data, null, 2)
  }
  catch {
    return String(data)
  }
}
</script>

<template>
  <BasicPage
    title="Operation Logs"
    description="View system operation history and user activities."
    sticky
  >
    <template #actions>
      <UiButton v-if="selectedIds.size > 0" variant="destructive" @click="requestDeleteSelected">
        <Trash2 class="mr-2 size-4" />
        Delete Selected ({{ selectedIds.size }})
      </UiButton>
      <UiButton variant="destructive" @click="requestDeleteAll">
        <Trash2 class="mr-2 size-4" />
        Clear All
      </UiButton>
    </template>

    <UiCard>
      <UiCardContent class="py-4">
        <div class="mb-4 flex flex-wrap gap-4">
          <UiInput
            v-model="searchUsername"
            placeholder="Search by username"
            class="max-w-xs"
            @keyup.enter="handleSearch"
          />
          <UiSelect v-model="searchStatus" @update:model-value="handleSearch">
            <UiSelectTrigger class="max-w-xs">
              <UiSelectValue placeholder="All status" />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectGroup>
                <UiSelectItem
                  v-for="option in statusOptions"
                  :key="option.value ?? 'all'"
                  :value="option.value ?? -1"
                >
                  {{ option.label }}
                </UiSelectItem>
              </UiSelectGroup>
            </UiSelectContent>
          </UiSelect>
          <UiInput
            v-model="searchIp"
            placeholder="Search by IP"
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
                  :checked="selectedIds.size === logs.length && logs.length > 0"
                  @update:checked="toggleSelectAll"
                />
              </UiTableHead>
              <UiTableHead>Username</UiTableHead>
              <UiTableHead>Operation</UiTableHead>
              <UiTableHead>Method</UiTableHead>
              <UiTableHead>Path</UiTableHead>
              <UiTableHead>Status</UiTableHead>
              <UiTableHead>IP</UiTableHead>
              <UiTableHead>Cost Time</UiTableHead>
              <UiTableHead>Operation Time</UiTableHead>
              <UiTableHead class="text-right">Actions</UiTableHead>
            </UiTableRow>
          </UiTableHeader>
          <UiTableBody>
            <UiTableRow v-for="log in logs" :key="log.id">
              <UiTableCell>
                <UiCheckbox
                  :checked="selectedIds.has(log.id)"
                  @update:checked="toggleSelect(log.id)"
                />
              </UiTableCell>
              <UiTableCell class="font-medium">{{ log.username || '-' }}</UiTableCell>
              <UiTableCell>{{ log.title }}</UiTableCell>
              <UiTableCell>
                <UiBadge variant="secondary">{{ log.method }}</UiBadge>
              </UiTableCell>
              <UiTableCell class="font-mono text-xs">{{ log.path }}</UiTableCell>
              <UiTableCell>
                <UiBadge :variant="getStatusVariant(log.status)">
                  {{ getStatusText(log.status) }}
                </UiBadge>
              </UiTableCell>
              <UiTableCell class="font-mono text-xs">{{ log.ip }}</UiTableCell>
              <UiTableCell>{{ formatCostTime(log.cost_time) }}</UiTableCell>
              <UiTableCell>{{ formatDate(log.opera_time) }}</UiTableCell>
              <UiTableCell class="text-right space-x-2">
                <UiButton size="sm" variant="ghost" @click="showDetail(log)">
                  View Detail
                </UiButton>
                <UiButton
                  size="sm"
                  variant="ghost"
                  class="text-destructive"
                  @click="requestDelete([log.id])"
                >
                  <Trash2 class="size-4" />
                </UiButton>
              </UiTableCell>
            </UiTableRow>
            <UiTableEmpty v-if="!logs.length" :colspan="10">
              No operation logs found.
            </UiTableEmpty>
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
      <UiDialogContent class="max-h-[90vh] overflow-y-auto max-w-4xl">
        <UiDialogHeader>
          <UiDialogTitle>Operation Log Detail</UiDialogTitle>
          <UiDialogDescription> Detailed information about the operation. </UiDialogDescription>
        </UiDialogHeader>

        <div v-if="selectedLog" class="space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <div class="text-sm font-medium text-muted-foreground">Username</div>
              <div class="text-sm">{{ selectedLog.username || '-' }}</div>
            </div>
            <div>
              <div class="text-sm font-medium text-muted-foreground">Operation</div>
              <div class="text-sm">{{ selectedLog.title }}</div>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <div class="text-sm font-medium text-muted-foreground">Method</div>
              <div>
                <UiBadge variant="secondary">{{ selectedLog.method }}</UiBadge>
              </div>
            </div>
            <div>
              <div class="text-sm font-medium text-muted-foreground">Status</div>
              <div>
                <UiBadge :variant="getStatusVariant(selectedLog.status)">
                  {{ getStatusText(selectedLog.status) }}
                </UiBadge>
              </div>
            </div>
            <div>
              <div class="text-sm font-medium text-muted-foreground">Status Code</div>
              <div class="text-sm">{{ selectedLog.code }}</div>
            </div>
          </div>

          <div>
            <div class="text-sm font-medium text-muted-foreground">Request Path</div>
            <div class="font-mono text-sm">{{ selectedLog.path }}</div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <div class="text-sm font-medium text-muted-foreground">IP Address</div>
              <div class="font-mono text-sm">{{ selectedLog.ip }}</div>
            </div>
            <div>
              <div class="text-sm font-medium text-muted-foreground">Location</div>
              <div class="text-sm">{{ getLocation(selectedLog) }}</div>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <div class="text-sm font-medium text-muted-foreground">OS</div>
              <div class="text-sm">{{ selectedLog.os || '-' }}</div>
            </div>
            <div>
              <div class="text-sm font-medium text-muted-foreground">Browser</div>
              <div class="text-sm">{{ selectedLog.browser || '-' }}</div>
            </div>
            <div>
              <div class="text-sm font-medium text-muted-foreground">Device</div>
              <div class="text-sm">{{ selectedLog.device || '-' }}</div>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <div class="text-sm font-medium text-muted-foreground">Operation Time</div>
              <div class="text-sm">{{ formatDate(selectedLog.opera_time) }}</div>
            </div>
            <div>
              <div class="text-sm font-medium text-muted-foreground">Cost Time</div>
              <div class="text-sm">{{ formatCostTime(selectedLog.cost_time) }}</div>
            </div>
          </div>

          <div v-if="selectedLog.args">
            <div class="text-sm font-medium text-muted-foreground">Request Arguments</div>
            <UiScrollArea class="h-32 w-full rounded-md border p-4">
              <pre class="text-xs">{{ formatData(selectedLog.args) }}</pre>
            </UiScrollArea>
          </div>

          <div v-if="selectedLog.msg">
            <div class="text-sm font-medium text-muted-foreground">Message</div>
            <UiScrollArea class="h-24 w-full rounded-md border p-4">
              <p class="text-sm">{{ selectedLog.msg }}</p>
            </UiScrollArea>
          </div>

          <div>
            <div class="text-sm font-medium text-muted-foreground">Trace ID</div>
            <div class="font-mono text-xs">{{ selectedLog.trace_id }}</div>
          </div>

          <div>
            <div class="text-sm font-medium text-muted-foreground">User Agent</div>
            <UiScrollArea class="h-24 w-full rounded-md border p-4">
              <p class="font-mono text-xs break-all">{{ selectedLog.user_agent }}</p>
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
      <template #title> Delete operation logs </template>
      <template #description>
        This action cannot be undone. {{ deleteTargets.length }} record(s) will be permanently
        removed.
      </template>
    </ConfirmDialog>

    <ConfirmDialog
      v-model:open="deleteAllDialogOpen"
      :is-loading="isDeleting"
      destructive
      confirm-button-text="Clear All"
      @confirm="handleDeleteAllConfirm"
    >
      <template #title> Clear all operation logs </template>
      <template #description>
        This action cannot be undone. All operation logs will be permanently removed. This action
        cannot be reversed.
      </template>
    </ConfirmDialog>
  </BasicPage>
</template>
