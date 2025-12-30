<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { isAxiosError } from 'axios'
import { Plus } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import ConfirmDialog from '@/components/confirm-dialog.vue'
import { BasicPage } from '@/components/global-layout'
import { FormField } from '@/components/ui/form'
import {
  useCreateSchedulerMutation,
  useDeleteSchedulerMutation,
  useExecuteSchedulerMutation,
  useGetSchedulersQuery,
  useUpdateSchedulerMutation,
  useUpdateSchedulerStatusMutation,
  type TaskScheduler,
  type TaskSchedulerPayload,
} from '@/services/api/scheduler/manage/schedulers.api'

import { createColumns } from './components/columns'
import SchedulerDataTable from './components/data-table.vue'

const query = useGetSchedulersQuery(ref({ name: '', type: undefined }))
const createMutation = useCreateSchedulerMutation()
const updateMutation = useUpdateSchedulerMutation()
const deleteMutation = useDeleteSchedulerMutation()
const statusMutation = useUpdateSchedulerStatusMutation()
const executeMutation = useExecuteSchedulerMutation()

const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const editingScheduler = ref<TaskScheduler | null>(null)
const deleteTarget = ref<TaskScheduler | null>(null)

const searchName = ref('')
const searchType = ref<number | undefined>(undefined)

const isSaving = computed(() => createMutation.isPending.value || updateMutation.isPending.value)
const isDeleting = computed(() => deleteMutation.isPending.value)
const isTogglingStatus = ref(false)

const schedulerTypeOptions = [
  { label: 'Interval', value: 0 },
  { label: 'Crontab', value: 1 },
] as const

const periodTypeOptions = [
  { label: 'Days', value: 'days' },
  { label: 'Hours', value: 'hours' },
  { label: 'Minutes', value: 'minutes' },
  { label: 'Seconds', value: 'seconds' },
  { label: 'Microseconds', value: 'microseconds' },
] as const

const schedulerFormSchema = toTypedSchema(
  z.object({
    name: z.string().trim().min(1, 'Please enter a name.'),
    task: z.string().trim().min(1, 'Please enter a task name.'),
    args: z.string().optional(),
    kwargs: z.string().optional(),
    queue: z.string().optional(),
    exchange: z.string().optional(),
    routing_key: z.string().optional(),
    start_time: z.string().optional(),
    expire_time: z.string().optional(),
    expire_seconds: z.coerce.number().optional(),
    type: z.coerce.number().min(0).max(1),
    interval_every: z.coerce.number().optional(),
    interval_period: z.string().optional(),
    crontab: z.string().optional(),
    one_off: z.boolean(),
    remark: z.string().optional(),
  }),
)

const { handleSubmit, resetForm } = useForm({
  validationSchema: schedulerFormSchema,
  initialValues: {
    name: '',
    task: '',
    args: '',
    kwargs: '',
    queue: '',
    exchange: '',
    routing_key: '',
    start_time: '',
    expire_time: '',
    expire_seconds: undefined,
    type: 1,
    interval_every: undefined,
    interval_period: 'minutes',
    crontab: '* * * * *',
    one_off: false,
    remark: '',
  },
})

const schedulers = computed(() => query.data.value?.data?.items ?? [])
const pagination = computed(() => query.data.value?.data)
const isLoading = computed(() => query.isLoading.value)

const columns = computed(() =>
  createColumns({
    onEdit: scheduler => openEdit(scheduler),
    onDelete: scheduler => requestDelete(scheduler),
    onToggleStatus: scheduler => toggleStatus(scheduler),
    onExecute: scheduler => executeNow(scheduler),
  }),
)

watch(dialogOpen, (open) => {
  if (!open) {
    editingScheduler.value = null
  }
})

function getErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    return error.response?.data?.msg || error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Request failed'
}

function openCreate() {
  editingScheduler.value = null
  dialogOpen.value = true
  resetForm({
    values: {
      name: '',
      task: '',
      args: '',
      kwargs: '',
      queue: '',
      exchange: '',
      routing_key: '',
      start_time: '',
      expire_time: '',
      expire_seconds: undefined,
      type: 1,
      interval_every: undefined,
      interval_period: 'minutes',
      crontab: '* * * * *',
      one_off: false,
      remark: '',
    },
  })
}

function openEdit(scheduler: TaskScheduler) {
  editingScheduler.value = scheduler
  dialogOpen.value = true
  resetForm({
    values: {
      name: scheduler.name,
      task: scheduler.task,
      args: scheduler.args ? JSON.stringify(scheduler.args) : '',
      kwargs: scheduler.kwargs ? JSON.stringify(scheduler.kwargs) : '',
      queue: scheduler.queue ?? '',
      exchange: scheduler.exchange ?? '',
      routing_key: scheduler.routing_key ?? '',
      start_time: scheduler.start_time ? new Date(scheduler.start_time).toISOString().slice(0, 16) : '',
      expire_time: scheduler.expire_time ? new Date(scheduler.expire_time).toISOString().slice(0, 16) : '',
      expire_seconds: scheduler.expire_seconds ?? undefined,
      type: scheduler.type,
      interval_every: scheduler.interval_every ?? undefined,
      interval_period: scheduler.interval_period ?? 'minutes',
      crontab: scheduler.crontab,
      one_off: scheduler.one_off,
      remark: scheduler.remark ?? '',
    },
  })
}

function requestDelete(scheduler: TaskScheduler) {
  deleteTarget.value = scheduler
  deleteDialogOpen.value = true
}

async function toggleStatus(scheduler: TaskScheduler) {
  isTogglingStatus.value = true
  try {
    await statusMutation.mutateAsync(scheduler.id)
    toast.success(`Scheduler ${scheduler.enabled ? 'disabled' : 'enabled'}`)
  }
  catch (error) {
    toast.error(getErrorMessage(error))
  }
  finally {
    isTogglingStatus.value = false
  }
}

async function executeScheduler(scheduler: TaskScheduler) {
  try {
    await executeMutation.mutateAsync(scheduler.id)
    toast.success('Scheduler executed')
  }
  catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const onSubmit = handleSubmit(async (values) => {
  const payload: TaskSchedulerPayload = {
    name: values.name.trim(),
    task: values.task.trim(),
    args: values.args ? JSON.parse(values.args) : null,
    kwargs: values.kwargs ? JSON.parse(values.kwargs) : null,
    queue: values.queue?.trim() || null,
    exchange: values.exchange?.trim() || null,
    routing_key: values.routing_key?.trim() || null,
    start_time: values.start_time ? new Date(values.start_time).toISOString() : null,
    expire_time: values.expire_time ? new Date(values.expire_time).toISOString() : null,
    expire_seconds: values.expire_seconds || null,
    type: values.type,
    interval_every: values.interval_every || null,
    interval_period: values.interval_period || null,
    crontab: values.crontab.trim(),
    one_off: values.one_off,
    remark: values.remark?.trim() || null,
  }

  try {
    if (editingScheduler.value) {
      await updateMutation.mutateAsync({ id: editingScheduler.value.id, payload })
      toast.success('Scheduler updated')
    }
    else {
      await createMutation.mutateAsync(payload)
      toast.success('Scheduler created')
    }
    dialogOpen.value = false
  }
  catch (error) {
    toast.error(getErrorMessage(error))
  }
})

async function handleDeleteConfirm() {
  if (!deleteTarget.value) {
    return
  }
  try {
    await deleteMutation.mutateAsync(deleteTarget.value.id)
    toast.success('Scheduler deleted')
  }
  catch (error) {
    toast.error(getErrorMessage(error))
  }
  finally {
    deleteDialogOpen.value = false
    deleteTarget.value = null
  }
}

function handleSearch() {
  query.refetch()
}

function formatType(type: number) {
  return schedulerTypeOptions.find((option) => option.value === type)?.label || `Type ${type}`
}

function formatDate(dateStr: string | null) {
  if (!dateStr)
    return '-'
  return new Date(dateStr).toLocaleString()
}
</script>

<template>
  <BasicPage title="Task Schedulers" sticky>
    <template #actions>
      <UiButton @click="openCreate">
        <Plus class="mr-2 size-4" />
        New Scheduler
      </UiButton>
    </template>

    <div class="mb-4 flex gap-4">
      <UiInput
        v-model="searchName"
        placeholder="Search by name"
        class="max-w-xs"
        @keyup.enter="handleSearch"
      />
      <UiSelect v-model="searchType" class="max-w-xs">
        <UiSelectTrigger>
          <UiSelectValue placeholder="All types" />
        </UiSelectTrigger>
        <UiSelectContent>
          <UiSelectGroup>
            <UiSelectItem
              v-for="option in schedulerTypeOptions"
              :key="option.value"
              :value="String(option.value)"
            >
              {{ option.label }}
            </UiSelectItem>
          </UiSelectGroup>
        </UiSelectContent>
      </UiSelect>
      <UiButton @click="handleSearch"> Search </UiButton>
    </div>

    <div class="overflow-x-auto">
      <SchedulerDataTable :data="schedulers" :columns="columns" :loading="isLoading" />
    </div>

    <UiDialog v-model:open="dialogOpen">
      <UiDialogContent class="max-h-[90vh] overflow-y-auto">
        <UiDialogHeader>
          <UiDialogTitle>{{ editingScheduler ? 'Edit Scheduler' : 'New Scheduler' }}</UiDialogTitle>
          <UiDialogDescription> Configure Celery task scheduler. </UiDialogDescription>
        </UiDialogHeader>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <div class="grid gap-4 md:grid-cols-2">
            <FormField v-slot="{ componentField }" name="name">
              <UiFormItem>
                <UiFormLabel>Name</UiFormLabel>
                <UiFormControl>
                  <UiInput
                    v-bind="componentField"
                    placeholder="Scheduler name"
                    :disabled="isSaving"
                  />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="task">
              <UiFormItem>
                <UiFormLabel>Task</UiFormLabel>
                <UiFormControl>
                  <UiInput
                    v-bind="componentField"
                    placeholder="Celery task name"
                    :disabled="isSaving"
                  />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <FormField v-slot="{ componentField }" name="type">
              <UiFormItem>
                <UiFormLabel>Type</UiFormLabel>
                <UiSelect v-bind="componentField" :disabled="isSaving">
                  <UiFormControl>
                    <UiSelectTrigger>
                      <UiSelectValue placeholder="Select type" />
                    </UiSelectTrigger>
                  </UiFormControl>
                  <UiSelectContent>
                    <UiSelectGroup>
                      <UiSelectItem
                        v-for="option in schedulerTypeOptions"
                        :key="option.value"
                        :value="String(option.value)"
                      >
                        {{ option.label }}
                      </UiSelectItem>
                    </UiSelectGroup>
                  </UiSelectContent>
                </UiSelect>
                <UiFormMessage />
              </UiFormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="one_off">
              <UiFormItem class="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <UiFormLabel>One Off</UiFormLabel>
                  <UiFormDescription>Run only once.</UiFormDescription>
                </div>
                <UiFormControl>
                  <UiSwitch
                    :checked="componentField.modelValue"
                    :disabled="isSaving"
                    @update:checked="componentField['onUpdate:modelValue']"
                  />
                </UiFormControl>
              </UiFormItem>
            </FormField>
          </div>

          <FormField v-slot="{ componentField }" name="crontab">
            <UiFormItem>
              <UiFormLabel>Crontab Expression</UiFormLabel>
              <UiFormControl>
                <UiInput v-bind="componentField" placeholder="* * * * *" :disabled="isSaving" />
              </UiFormControl>
              <UiFormDescription>Format: minute hour day month weekday</UiFormDescription>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <div class="grid gap-4 md:grid-cols-2">
            <FormField v-slot="{ componentField }" name="interval_every">
              <UiFormItem>
                <UiFormLabel>Interval Every</UiFormLabel>
                <UiFormControl>
                  <UiInput v-bind="componentField" type="number" min="0" :disabled="isSaving" />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="interval_period">
              <UiFormItem>
                <UiFormLabel>Interval Period</UiFormLabel>
                <UiSelect v-bind="componentField" :disabled="isSaving">
                  <UiFormControl>
                    <UiSelectTrigger>
                      <UiSelectValue placeholder="Select period" />
                    </UiSelectTrigger>
                  </UiFormControl>
                  <UiSelectContent>
                    <UiSelectGroup>
                      <UiSelectItem
                        v-for="option in periodTypeOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </UiSelectItem>
                    </UiSelectGroup>
                  </UiSelectContent>
                </UiSelect>
                <UiFormMessage />
              </UiFormItem>
            </FormField>
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            <FormField v-slot="{ componentField }" name="queue">
              <UiFormItem>
                <UiFormLabel>Queue</UiFormLabel>
                <UiFormControl>
                  <UiInput v-bind="componentField" placeholder="Queue name" :disabled="isSaving" />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="exchange">
              <UiFormItem>
                <UiFormLabel>Exchange</UiFormLabel>
                <UiFormControl>
                  <UiInput
                    v-bind="componentField"
                    placeholder="AMQP exchange"
                    :disabled="isSaving"
                  />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="routing_key">
              <UiFormItem>
                <UiFormLabel>Routing Key</UiFormLabel>
                <UiFormControl>
                  <UiInput
                    v-bind="componentField"
                    placeholder="AMQP routing key"
                    :disabled="isSaving"
                  />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            <FormField v-slot="{ componentField }" name="start_time">
              <UiFormItem>
                <UiFormLabel>Start Time</UiFormLabel>
                <UiFormControl>
                  <UiInput v-bind="componentField" type="datetime-local" :disabled="isSaving" />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="expire_time">
              <UiFormItem>
                <UiFormLabel>Expire Time</UiFormLabel>
                <UiFormControl>
                  <UiInput v-bind="componentField" type="datetime-local" :disabled="isSaving" />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="expire_seconds">
              <UiFormItem>
                <UiFormLabel>Expire Seconds</UiFormLabel>
                <UiFormControl>
                  <UiInput v-bind="componentField" type="number" min="0" :disabled="isSaving" />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <FormField v-slot="{ componentField }" name="args">
              <UiFormItem>
                <UiFormLabel>Args (JSON)</UiFormLabel>
                <UiFormControl>
                  <UiInput
                    v-bind="componentField"
                    placeholder='["arg1", "arg2"]'
                    :disabled="isSaving"
                  />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="kwargs">
              <UiFormItem>
                <UiFormLabel>Kwargs (JSON)</UiFormLabel>
                <UiFormControl>
                  <UiInput
                    v-bind="componentField"
                    placeholder='{"key": "value"}'
                    :disabled="isSaving"
                  />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>
          </div>

          <FormField v-slot="{ componentField }" name="remark">
            <UiFormItem>
              <UiFormLabel>Remark</UiFormLabel>
              <UiFormControl>
                <UiInput
                  v-bind="componentField"
                  placeholder="Optional remark"
                  :disabled="isSaving"
                />
              </UiFormControl>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <UiDialogFooter class="gap-2">
            <UiButton type="button" variant="outline" @click="dialogOpen = false">
              Cancel
            </UiButton>
            <UiButton type="submit" :disabled="isSaving">
              {{ editingScheduler ? 'Save Changes' : 'Create Scheduler' }}
            </UiButton>
          </UiDialogFooter>
        </form>
      </UiDialogContent>
    </UiDialog>

    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      :is-loading="isDeleting"
      destructive
      confirm-button-text="Delete"
      @confirm="handleDeleteConfirm"
    >
      <template #title> Delete scheduler </template>
      <template #description>
        This action cannot be undone. The scheduler will be permanently removed.
      </template>
    </ConfirmDialog>
  </BasicPage>
</template>
