<script setup lang="ts">
import { isAxiosError } from 'axios'
import { LogOut, RefreshCw } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import ConfirmDialog from '@/components/confirm-dialog.vue'
import { BasicPage } from '@/components/global-layout'
import {
  useGetOnlineUsersQuery,
  useKickOnlineUserMutation,
  type OnlineUserDetail,
} from '@/services/api/log/online/online-users.api'

import { createColumns } from './components/columns'
import OnlineUserDataTable from './components/data-table.vue'

const query = useGetOnlineUsersQuery()
const kickMutation = useKickOnlineUserMutation()

const deleteDialogOpen = ref(false)
const kickTarget = ref<OnlineUserDetail | null>(null)

const isKicking = computed(() => kickMutation.isPending.value)
const isRefetching = computed(() => query.isFetching.value)

const onlineUsers = computed(() => query.data.value?.data ?? [])
const onlineCount = computed(() => onlineUsers.value.filter(u => u.status === 1).length)
const totalCount = computed(() => onlineUsers.value.length)
const isLoading = computed(() => query.isLoading.value)

const columns = computed(() =>
  createColumns((user: OnlineUserDetail) => requestKick(user)),
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

function requestKick(user: OnlineUserDetail) {
  kickTarget.value = user
  deleteDialogOpen.value = true
}

async function handleKickConfirm() {
  if (!kickTarget.value) {
    return
  }
  try {
    await kickMutation.mutateAsync({
      id: kickTarget.value.id,
      sessionUuid: kickTarget.value.session_uuid,
    })
    toast.success('User kicked successfully')
  }
  catch (error) {
    toast.error(getErrorMessage(error))
  }
  finally {
    deleteDialogOpen.value = false
    kickTarget.value = null
  }
}
</script>

<template>
  <BasicPage title="Online Users" sticky>
    <template #actions>
      <UiButton :disabled="isRefetching" @click="query.refetch">
        <RefreshCw class="mr-2 size-4" :class="{ 'animate-spin': isRefetching }" />
        Refresh
      </UiButton>
    </template>

    <div class="mb-4 flex gap-4">
      <UiCard class="flex-1">
        <UiCardContent class="p-4">
          <div class="text-sm text-muted-foreground">Online Users</div>
          <div class="text-2xl font-bold">{{ onlineCount }}</div>
        </UiCardContent>
      </UiCard>
      <UiCard class="flex-1">
        <UiCardContent class="p-4">
          <div class="text-sm text-muted-foreground">Total Sessions</div>
          <div class="text-2xl font-bold">{{ totalCount }}</div>
        </UiCardContent>
      </UiCard>
    </div>

    <div class="overflow-x-auto">
      <OnlineUserDataTable :data="onlineUsers" :columns="columns" :loading="isLoading" />
    </div>

    <!-- Kick Confirmation Dialog -->
    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      :is-loading="isKicking"
      destructive
      confirm-button-text="Kick"
      @confirm="handleKickConfirm"
    >
      <template #title> Kick user </template>
      <template #description>
        This will force the user <span class="font-semibold">{{ kickTarget?.username }}</span> to
        log out. The user will need to log in again to access the system.
      </template>
    </ConfirmDialog>
  </BasicPage>
</template>
