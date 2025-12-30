<script setup lang="ts">
import { Activity, Database, Timer, Zap } from 'lucide-vue-next'

import { BasicPage } from '@/components/global-layout'
import { useGetRedisMonitorQuery } from '@/services/api/monitor/redis/redis-monitor.api'

const query = useGetRedisMonitorQuery()

const redisInfo = computed(() => query.data.value?.data?.info ?? {})
const commandStats = computed(() => query.data.value?.data?.stats ?? [])
const isLoading = computed(() => query.isLoading.value)
const error = computed(() => query.error.value)

const displayFields = computed(() => [
  { key: 'redis_version', label: 'Redis Version', icon: Database },
  { key: 'keys_num', label: 'Total Keys', icon: Zap },
  { key: 'uptime_in_seconds', label: 'Uptime', icon: Timer },
  { key: 'connected_clients', label: 'Connected Clients', icon: Activity },
  { key: 'used_memory_human', label: 'Used Memory', icon: Database },
  { key: 'maxmemory_human', label: 'Max Memory', icon: Database },
])

const displayedStats = computed(() => {
  return commandStats.value
    .filter((stat) => Number(stat.value) > 0)
    .sort((a, b) => Number(b.value) - Number(a.value))
    .slice(0, 10)
})

function getValue(key: string) {
  return redisInfo.value[key] || '-'
}

function formatNumber(value: string) {
  const num = Number(value)
  if (Number.isNaN(num))
    return value
  return num.toLocaleString()
}
</script>

<template>
  <BasicPage title="Redis Monitor" sticky>
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <UiSpinner class="mr-2" />
      <span class="text-muted-foreground">Loading Redis information...</span>
    </div>

    <UiAlert v-else-if="error" variant="destructive" class="mb-4">
      <UiAlertTitle>Error</UiAlertTitle>
      <UiAlertDescription>
        Failed to load Redis information. {{ error.message }}
      </UiAlertDescription>
    </UiAlert>

    <template v-else>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <UiCard v-for="field in displayFields" :key="field.key">
          <UiCardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-muted-foreground">{{ field.label }}</p>
                <p class="text-2xl font-bold">
                  {{ field.key.includes('num') || field.key.includes('clients')
                    ? formatNumber(getValue(field.key))
                    : getValue(field.key) }}
                </p>
              </div>
              <component :is="field.icon" class="size-8 text-muted-foreground" />
            </div>
          </UiCardContent>
        </UiCard>
      </div>

      <UiCard class="mt-6">
        <UiCardHeader>
          <UiCardTitle>Command Statistics (Top 10)</UiCardTitle>
          <UiCardDescription>Most frequently used Redis commands</UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div v-if="displayedStats.length === 0" class="py-8 text-center text-muted-foreground">
            No command statistics available
          </div>
          <UiTable v-else>
            <UiTableHeader>
              <UiTableRow>
                <UiTableHead>Rank</UiTableHead>
                <UiTableHead>Command</UiTableHead>
                <UiTableHead class="text-right">Calls</UiTableHead>
                <UiTableHead class="text-right">Percentage</UiTableHead>
              </UiTableRow>
            </UiTableHeader>
            <UiTableBody>
              <UiTableRow v-for="(stat, index) in displayedStats" :key="stat.name">
                <UiTableCell class="font-medium">#{{ index + 1 }}</UiTableCell>
                <UiTableCell>
                  <UiBadge variant="secondary">{{ stat.name }}</UiBadge>
                </UiTableCell>
                <UiTableCell
                  class="text-right font-mono"
                  >{{ formatNumber(stat.value) }}</UiTableCell
                >
                <UiTableCell class="text-right">
                  {{
                    commandStats.length > 0
                      ? `${((Number(stat.value)
                        / commandStats.reduce((sum, s) => sum + Number(s.value), 0))
                        * 100).toFixed(2)}%`
                      : '0%'
                  }}
                </UiTableCell>
              </UiTableRow>
            </UiTableBody>
          </UiTable>
        </UiCardContent>
      </UiCard>

      <UiCard class="mt-6">
        <UiCardHeader>
          <UiCardTitle>Additional Information</UiCardTitle>
          <UiCardDescription>Detailed Redis server configuration and status</UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div class="grid gap-4 md:grid-cols-2">
            <div
              v-for="(value, key) in redisInfo"
              :key="key"
              class="flex justify-between border-b py-2"
            >
              <span class="text-sm font-medium text-muted-foreground">{{ key }}</span>
              <span class="text-sm font-mono">{{ value }}</span>
            </div>
          </div>
        </UiCardContent>
      </UiCard>
    </template>
  </BasicPage>
</template>
