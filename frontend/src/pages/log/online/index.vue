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
} from '@/services/api/online-users.api'

const query = useGetOnlineUsersQuery()
const kickMutation = useKickOnlineUserMutation()

const deleteDialogOpen = ref(false)
const kickTarget = ref<OnlineUserDetail | null>(null)

const isKicking = computed(() => kickMutation.isPending.value)
const isRefetching = computed(() => query.isFetching.value)

const onlineUsers = computed(() => query.data.value?.data ?? [])
const onlineCount = computed(() => onlineUsers.value.filter(u => u.status === 1).length)
const totalCount = computed(() => onlineUsers.value.length)

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

function formatDevice(user: OnlineUserDetail) {
  const parts = [user.os, user.browser, user.device].filter(Boolean)
  return parts.join(' / ') || 'Unknown'
}

function formatTime(time: string) {
  if (time === '未知' || !time) {
    return '-'
  }
  try {
    return new Date(time).toLocaleString()
  }
  catch {
    return time
  }
}

function getExpireTime(expireTime: string) {
  try {
    const expire = new Date(expireTime)
    const now = new Date()
    const diff = expire.getTime() - now.getTime()

    if (diff <= 0) {
      return 'Expired'
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }
  catch {
    return '-'
  }
}
</script>

<template>
  <BasicPage title="Online Users" description="Monitor and manage currently logged-in users." sticky>
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

    <UiCard>
      <UiCardContent class="py-4">
        <UiTable>
          <UiTableHeader>
            <UiTableRow>
              <UiTableHead>User</UiTableHead>
              <UiTableHead>IP Address</UiTableHead>
              <UiTableHead>Device</UiTableHead>
              <UiTableHead>Status</UiTableHead>
              <UiTableHead>Last Login</UiTableHead>
              <UiTableHead>Expires In</UiTableHead>
              <UiTableHead class="text-right">Actions</UiTableHead>
            </UiTableRow>
          </UiTableHeader>
          <UiTableBody>
            <UiTableRow v-for="user in onlineUsers" :key="user.session_uuid">
              <UiTableCell>
                <div>
                  <div class="font-medium">{{ user.nickname || user.username }}</div>
                  <div class="text-sm text-muted-foreground">@{{ user.username }}</div>
                </div>
              </UiTableCell>
              <UiTableCell>
                <code class="rounded bg-muted px-2 py-1 text-sm">{{ user.ip }}</code>
              </UiTableCell>
              <UiTableCell>
                <div class="flex items-center gap-2 text-sm">
                  <div>{{ formatDevice(user) }}</div>
                </div>
              </UiTableCell>
              <UiTableCell>
                <UiBadge :variant="user.status === 1 ? 'default' : 'secondary'">
                  {{ user.status === 1 ? 'Online' : 'Offline' }}
                </UiBadge>
              </UiTableCell>
              <UiTableCell>
                <div class="text-sm">
                  {{ formatTime(user.last_login_time) }}
                </div>
              </UiTableCell>
              <UiTableCell>
                <div class="text-sm">
                  {{ getExpireTime(user.expire_time) }}
                </div>
              </UiTableCell>
              <UiTableCell class="text-right">
                <UiButton
                  size="sm"
                  variant="ghost"
                  :disabled="user.status !== 1"
                  @click="requestKick(user)"
                >
                  <LogOut class="mr-1 size-4" />
                  Kick
                </UiButton>
              </UiTableCell>
            </UiTableRow>
            <UiTableEmpty v-if="!onlineUsers.length" colspan="7">
              No online users found.
            </UiTableEmpty>
          </UiTableBody>
        </UiTable>
      </UiCardContent>
    </UiCard>

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
        This will force the user <span class="font-semibold">{{ kickTarget?.username }}</span> to log out.
        The user will need to log in again to access the system.
      </template>
    </ConfirmDialog>
  </BasicPage>
</template>
