<script setup lang="ts">
import {
  Cpu,
  HardDrive,
  MemoryStick,
  Monitor,
  Server,
  Settings,
} from 'lucide-vue-next'

import { BasicPage } from '@/components/global-layout'
import { useGetServerMonitorQuery } from '@/services/api/server-monitor.api'

const query = useGetServerMonitorQuery()

const serverData = computed(() => query.data.value?.data)
const isLoading = computed(() => query.isLoading.value)
const error = computed(() => query.error.value)

function getUsageColor(percentage: number) {
  if (percentage < 50)
    return 'text-green-600'
  if (percentage < 80)
    return 'text-yellow-600'
  return 'text-red-600'
}

function getUsageVariant(percentage: number) {
  if (percentage < 50)
    return 'default'
  if (percentage < 80)
    return 'secondary'
  return 'destructive'
}
</script>

<template>
  <BasicPage
    title="Server Monitor"
    description="Real-time server performance and resource monitoring."
    sticky
  >
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <UiSpinner class="mr-2" />
      <span class="text-muted-foreground">Loading server information...</span>
    </div>

    <UiAlert v-else-if="error" variant="destructive" class="mb-4">
      <UiAlertTitle>Error</UiAlertTitle>
      <UiAlertDescription>
        Failed to load server information. {{ error.message }}
      </UiAlertDescription>
    </UiAlert>

    <template v-else-if="serverData">
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <UiCard>
          <UiCardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-muted-foreground">CPU Usage</p>
                <p class="text-2xl font-bold" :class="getUsageColor(serverData.cpu.usage)">
                  {{ serverData.cpu.usage }}%
                </p>
              </div>
              <Cpu class="size-8 text-muted-foreground" />
            </div>
            <div class="mt-2 space-y-1 text-xs text-muted-foreground">
              <div>Logical: {{ serverData.cpu.logical_num }} cores</div>
              <div>Physical: {{ serverData.cpu.physical_num }} cores</div>
            </div>
          </UiCardContent>
        </UiCard>

        <UiCard>
          <UiCardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-muted-foreground">Memory Usage</p>
                <p class="text-2xl font-bold" :class="getUsageColor(serverData.mem.usage)">
                  {{ serverData.mem.usage }}%
                </p>
              </div>
              <MemoryStick class="size-8 text-muted-foreground" />
            </div>
            <div class="mt-2 space-y-1 text-xs text-muted-foreground">
              <div>Used: {{ serverData.mem.used }} GB / {{ serverData.mem.total }} GB</div>
              <div>Free: {{ serverData.mem.free }} GB</div>
            </div>
          </UiCardContent>
        </UiCard>

        <UiCard>
          <UiCardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-muted-foreground">Disk Usage</p>
                <p class="text-2xl font-bold">
                  {{ serverData.disk[0]?.usage ?? '-' }}
                </p>
              </div>
              <HardDrive class="size-8 text-muted-foreground" />
            </div>
            <div class="mt-2 space-y-1 text-xs text-muted-foreground">
              <div>
                {{ serverData.disk[0]?.used ?? '-' }} / {{ serverData.disk[0]?.total ?? '-' }}
              </div>
              <div>Free: {{ serverData.disk[0]?.free ?? '-' }}</div>
            </div>
          </UiCardContent>
        </UiCard>

        <UiCard>
          <UiCardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-muted-foreground">Service CPU</p>
                <p class="text-2xl font-bold">
                  {{ serverData.service.cpu_usage }}
                </p>
              </div>
              <Settings class="size-8 text-muted-foreground" />
            </div>
            <div class="mt-2 space-y-1 text-xs text-muted-foreground">
              <div>{{ serverData.service.name }} {{ serverData.service.version }}</div>
              <div>Elapsed: {{ serverData.service.elapsed }}</div>
            </div>
          </UiCardContent>
        </UiCard>
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <UiCard>
          <UiCardHeader>
            <UiCardTitle class="flex items-center gap-2">
              <Monitor class="size-5" />
              System Information
            </UiCardTitle>
          </UiCardHeader>
          <UiCardContent>
            <div class="space-y-3">
              <div class="flex justify-between border-b py-2">
                <span class="text-sm font-medium text-muted-foreground">Hostname</span>
                <span class="text-sm font-mono">{{ serverData.sys.name }}</span>
              </div>
              <div class="flex justify-between border-b py-2">
                <span class="text-sm font-medium text-muted-foreground">IP Address</span>
                <span class="text-sm font-mono">{{ serverData.sys.ip }}</span>
              </div>
              <div class="flex justify-between border-b py-2">
                <span class="text-sm font-medium text-muted-foreground">Operating System</span>
                <span class="text-sm font-mono">{{ serverData.sys.os }}</span>
              </div>
              <div class="flex justify-between border-b py-2">
                <span class="text-sm font-medium text-muted-foreground">Architecture</span>
                <span class="text-sm font-mono">{{ serverData.sys.arch }}</span>
              </div>
            </div>
          </UiCardContent>
        </UiCard>

        <UiCard>
          <UiCardHeader>
            <UiCardTitle class="flex items-center gap-2">
              <Cpu class="size-5" />
              CPU Details
            </UiCardTitle>
          </UiCardHeader>
          <UiCardContent>
            <div class="space-y-3">
              <div class="flex justify-between border-b py-2">
                <span class="text-sm font-medium text-muted-foreground">Usage</span>
                <div class="flex items-center gap-2">
                  <UiProgress :value="serverData.cpu.usage" class="w-24" />
                  <span class="text-sm font-mono" :class="getUsageColor(serverData.cpu.usage)"
                    >{{ serverData.cpu.usage }}%</span
                  >
                </div>
              </div>
              <div class="flex justify-between border-b py-2">
                <span class="text-sm font-medium text-muted-foreground">Logical Cores</span>
                <span class="text-sm font-mono">{{ serverData.cpu.logical_num }}</span>
              </div>
              <div class="flex justify-between border-b py-2">
                <span class="text-sm font-medium text-muted-foreground">Physical Cores</span>
                <span class="text-sm font-mono">{{ serverData.cpu.physical_num }}</span>
              </div>
              <div class="flex justify-between border-b py-2">
                <span class="text-sm font-medium text-muted-foreground">Current Frequency</span>
                <span class="text-sm font-mono">{{ serverData.cpu.current_freq }} MHz</span>
              </div>
              <div class="flex justify-between border-b py-2">
                <span class="text-sm font-medium text-muted-foreground">Min Frequency</span>
                <span class="text-sm font-mono">{{ serverData.cpu.min_freq }} MHz</span>
              </div>
              <div class="flex justify-between border-b py-2">
                <span class="text-sm font-medium text-muted-foreground">Max Frequency</span>
                <span class="text-sm font-mono">{{ serverData.cpu.max_freq }} MHz</span>
              </div>
            </div>
          </UiCardContent>
        </UiCard>

        <UiCard>
          <UiCardHeader>
            <UiCardTitle class="flex items-center gap-2">
              <MemoryStick class="size-5" />
              Memory Details
            </UiCardTitle>
          </UiCardHeader>
          <UiCardContent>
            <div class="space-y-3">
              <div class="flex justify-between border-b py-2">
                <span class="text-sm font-medium text-muted-foreground">Usage</span>
                <div class="flex items-center gap-2">
                  <UiProgress :value="serverData.mem.usage" class="w-24" />
                  <span class="text-sm font-mono" :class="getUsageColor(serverData.mem.usage)"
                    >{{ serverData.mem.usage }}%</span
                  >
                </div>
              </div>
              <div class="flex justify-between border-b py-2">
                <span class="text-sm font-medium text-muted-foreground">Total Memory</span>
                <span class="text-sm font-mono">{{ serverData.mem.total }} GB</span>
              </div>
              <div class="flex justify-between border-b py-2">
                <span class="text-sm font-medium text-muted-foreground">Used Memory</span>
                <span class="text-sm font-mono">{{ serverData.mem.used }} GB</span>
              </div>
              <div class="flex justify-between border-b py-2">
                <span class="text-sm font-medium text-muted-foreground">Free Memory</span>
                <span class="text-sm font-mono">{{ serverData.mem.free }} GB</span>
              </div>
            </div>
          </UiCardContent>
        </UiCard>

        <UiCard>
          <UiCardHeader>
            <UiCardTitle class="flex items-center gap-2">
              <Server class="size-5" />
              Service Information
            </UiCardTitle>
          </UiCardHeader>
          <UiCardContent>
            <div class="space-y-3">
              <div class="flex justify-between border-b py-2">
                <span class="text-sm font-medium text-muted-foreground">Name</span>
                <span class="text-sm font-mono">{{ serverData.service.name }}</span>
              </div>
              <div class="flex justify-between border-b py-2">
                <span class="text-sm font-medium text-muted-foreground">Version</span>
                <span class="text-sm font-mono">{{ serverData.service.version }}</span>
              </div>
              <div class="flex justify-between border-b py-2">
                <span class="text-sm font-medium text-muted-foreground">CPU Usage</span>
                <span class="text-sm font-mono">{{ serverData.service.cpu_usage }}</span>
              </div>
              <div class="flex justify-between border-b py-2">
                <span class="text-sm font-medium text-muted-foreground">Memory VMS</span>
                <span class="text-sm font-mono">{{ serverData.service.mem_vms }}</span>
              </div>
              <div class="flex justify-between border-b py-2">
                <span class="text-sm font-medium text-muted-foreground">Memory RSS</span>
                <span class="text-sm font-mono">{{ serverData.service.mem_rss }}</span>
              </div>
              <div class="flex justify-between border-b py-2">
                <span class="text-sm font-medium text-muted-foreground">Startup Time</span>
                <span class="text-sm font-mono">{{ serverData.service.startup }}</span>
              </div>
              <div class="flex justify-between border-b py-2">
                <span class="text-sm font-medium text-muted-foreground">Running Time</span>
                <span class="text-sm font-mono">{{ serverData.service.elapsed }}</span>
              </div>
            </div>
          </UiCardContent>
        </UiCard>
      </div>

      <UiCard class="mt-6">
        <UiCardHeader>
          <UiCardTitle class="flex items-center gap-2">
            <HardDrive class="size-5" />
            Disk Usage
          </UiCardTitle>
        </UiCardHeader>
        <UiCardContent>
          <div v-if="serverData.disk.length === 0" class="py-8 text-center text-muted-foreground">
            No disk information available
          </div>
          <UiTable v-else>
            <UiTableHeader>
              <UiTableRow>
                <UiTableHead>Mount Point</UiTableHead>
                <UiTableHead>Type</UiTableHead>
                <UiTableHead>Device</UiTableHead>
                <UiTableHead class="text-right">Total</UiTableHead>
                <UiTableHead class="text-right">Used</UiTableHead>
                <UiTableHead class="text-right">Free</UiTableHead>
                <UiTableHead class="text-right">Usage</UiTableHead>
              </UiTableRow>
            </UiTableHeader>
            <UiTableBody>
              <UiTableRow v-for="(disk, index) in serverData.disk" :key="index">
                <UiTableCell class="font-medium">{{ disk.dir }}</UiTableCell>
                <UiTableCell>
                  <UiBadge variant="secondary">{{ disk.type }}</UiBadge>
                </UiTableCell>
                <UiTableCell class="font-mono text-xs">{{ disk.device }}</UiTableCell>
                <UiTableCell class="text-right font-mono">{{ disk.total }}</UiTableCell>
                <UiTableCell class="text-right font-mono">{{ disk.used }}</UiTableCell>
                <UiTableCell class="text-right font-mono">{{ disk.free }}</UiTableCell>
                <UiTableCell class="text-right">
                  <UiBadge :variant="getUsageVariant(Number.parseFloat(disk.usage))">
                    {{ disk.usage }}
                  </UiBadge>
                </UiTableCell>
              </UiTableRow>
            </UiTableBody>
          </UiTable>
        </UiCardContent>
      </UiCard>
    </template>
  </BasicPage>
</template>
