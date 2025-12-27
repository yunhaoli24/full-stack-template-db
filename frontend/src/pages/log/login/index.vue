<script setup lang="ts">
import { isAxiosError } from 'axios'
import { Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import type { ServerPagination } from '@/components/data-table/types'
import ConfirmDialog from '@/components/confirm-dialog.vue'
import { BasicPage } from '@/components/global-layout'
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from '@/constants/pagination'
import {
  useDeleteAllLoginLogsMutation,
  useDeleteLoginLogsMutation,
  useGetLoginLogsQuery,
  type LoginLog,
} from '@/services/api/login-logs.api'

import { createColumns } from './components/columns'
import LoginLogDataTable from './components/data-table'

const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const searchUsername = ref('')
const searchStatus = ref<number | undefined>(undefined)
const searchIp = ref('')

const query = useGetLoginLogsQuery(
  computed(() => ({
    page: page.value,
    size: pageSize.value,
    username: searchUsername.value || undefined,
    status: searchStatus.value,
    ip: searchIp.value || undefined,
  })),
)
const deleteMutation = useDeleteLoginLogsMutation()
const deleteAllMutation = useDeleteAllLoginLogsMutation()

const deleteDialogOpen = ref(false)
const deleteAllDialogOpen = ref(false)
const deleteTargets = ref<number[]>([])
const selectedIds = ref<Set<number>>(new Set())

const isDeleting = computed(() => deleteMutation.isPending.value || deleteAllMutation.isPending.value)

const logs = computed(() => query.data.value?.data?.items ?? [])
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
  }),
)

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

function getLocation(log: LoginLog) {
  const parts = [log.country, log.region, log.city].filter(Boolean)
  return parts.length > 0 ? parts.join(' - ') : '-'
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
    toast.success('All login logs deleted')
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
const selectedLog = ref<LoginLog | null>(null)

function showDetail(log: LoginLog) {
  selectedLog.value = log
  detailDialogOpen.value = true
}
</script>

<template>
  <BasicPage
    title="Login Logs"
    description="View user login history and authentication records."
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

        <LoginLogDataTable
          :data="logs"
          :columns="columns"
          :loading="isLoading"
          :server-pagination="serverPagination"
        />
      </UiCardContent>
    </UiCard>

    <UiDialog v-model:open="detailDialogOpen">
      <UiDialogContent class="max-h-[90vh] overflow-y-auto max-w-3xl">
        <UiDialogHeader>
          <UiDialogTitle>Login Log Detail</UiDialogTitle>
          <UiDialogDescription> Detailed information about the login attempt. </UiDialogDescription>
        </UiDialogHeader>

        <div v-if="selectedLog" class="space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <div class="text-sm font-medium text-muted-foreground">Username</div>
              <div class="text-sm">{{ selectedLog.username }}</div>
            </div>
            <div>
              <div class="text-sm font-medium text-muted-foreground">Status</div>
              <div>
                <UiBadge :variant="getStatusVariant(selectedLog.status)">
                  {{ getStatusText(selectedLog.status) }}
                </UiBadge>
              </div>
            </div>
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
              <div class="text-sm font-medium text-muted-foreground">Browser</div>
              <div class="text-sm">{{ selectedLog.browser || '-' }}</div>
            </div>
            <div>
              <div class="text-sm font-medium text-muted-foreground">OS</div>
              <div class="text-sm">{{ selectedLog.os || '-' }}</div>
            </div>
            <div>
              <div class="text-sm font-medium text-muted-foreground">Device</div>
              <div class="text-sm">{{ selectedLog.device || '-' }}</div>
            </div>
          </div>

          <div>
            <div class="text-sm font-medium text-muted-foreground">Login Time</div>
            <div class="text-sm">{{ formatDate(selectedLog.login_time) }}</div>
          </div>

          <div>
            <div class="text-sm font-medium text-muted-foreground">Message</div>
            <UiScrollArea class="h-24 w-full rounded-md border p-4">
              <p class="text-sm">{{ selectedLog.msg }}</p>
            </UiScrollArea>
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
      <template #title> Delete login logs </template>
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
      <template #title> Clear all login logs </template>
      <template #description>
        This action cannot be undone. All login logs will be permanently removed. This action cannot
        be reversed.
      </template>
    </ConfirmDialog>
  </BasicPage>
</template>
