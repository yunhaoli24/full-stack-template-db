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
  useCreateDataScopeMutation,
  useDeleteDataScopeMutation,
  useGetDataScopesQuery,
  useUpdateDataScopeMutation,
  useUpdateDataScopeRulesMutation,
  type DataScopeDetail,
  type DataScopePayload,
} from '@/services/api/data-scopes.api'
import { useGetDataRulesQuery } from '@/services/api/data-rules.api'

import { createColumns } from './components/columns'
import DataScopeDataTable from './components/data-table'

const query = useGetDataScopesQuery()
const rulesQuery = useGetDataRulesQuery()
const createMutation = useCreateDataScopeMutation()
const updateMutation = useUpdateDataScopeMutation()
const deleteMutation = useDeleteDataScopeMutation()
const updateRulesMutation = useUpdateDataScopeRulesMutation()

const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const rulesDialogOpen = ref(false)
const editingScope = ref<DataScopeDetail | null>(null)
const deleteTarget = ref<DataScopeDetail | null>(null)
const rulesTarget = ref<DataScopeDetail | null>(null)

const isSaving = computed(() => createMutation.isPending.value || updateMutation.isPending.value)
const isDeleting = computed(() => deleteMutation.isPending.value)
const isSavingRules = computed(() => updateRulesMutation.isPending.value)

const formSchema = toTypedSchema(
  z.object({
    name: z.string().trim().min(1, 'Please enter a name.'),
    status: z.boolean(),
  }),
)

const { handleSubmit, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    status: true,
  },
})

const dataScopes = computed(() => query.data.value?.data ?? [])
const allRules = computed(() => rulesQuery.data.value?.data ?? [])
const isLoading = computed(() => query.isLoading.value)

const columns = computed(() =>
  createColumns({
    onEdit: scope => openEdit(scope),
    onDelete: scope => requestDelete(scope),
    onConfigureRules: scope => openRules(scope),
  }),
)
const selectedRuleIds = ref<number[]>([])

watch(dialogOpen, (open) => {
  if (!open) {
    editingScope.value = null
  }
})

watch(rulesDialogOpen, (open) => {
  if (!open) {
    rulesTarget.value = null
    selectedRuleIds.value = []
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
  editingScope.value = null
  dialogOpen.value = true
  resetForm({
    values: {
      name: '',
      status: true,
    },
  })
}

function openEdit(scope: DataScopeDetail) {
  editingScope.value = scope
  dialogOpen.value = true
  resetForm({
    values: {
      name: scope.name,
      status: scope.status === 1,
    },
  })
}

function openRules(scope: DataScopeDetail) {
  rulesTarget.value = scope
  // Get current rules for this scope
  // For simplicity, we'll let the user select rules from all available rules
  selectedRuleIds.value = []
  rulesDialogOpen.value = true
}

function requestDelete(scope: DataScopeDetail) {
  deleteTarget.value = scope
  deleteDialogOpen.value = true
}

const onSubmit = handleSubmit(async (values) => {
  const payload: DataScopePayload = {
    name: values.name.trim(),
    status: values.status ? 1 : 0,
  }

  try {
    if (editingScope.value) {
      await updateMutation.mutateAsync({ id: editingScope.value.id, payload })
      toast.success('Data scope updated')
    }
    else {
      await createMutation.mutateAsync(payload)
      toast.success('Data scope created')
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
    await deleteMutation.mutateAsync([deleteTarget.value.id])
    toast.success('Data scope deleted')
  }
  catch (error) {
    toast.error(getErrorMessage(error))
  }
  finally {
    deleteDialogOpen.value = false
    deleteTarget.value = null
  }
}

async function handleRulesSave() {
  if (!rulesTarget.value) {
    return
  }
  try {
    await updateRulesMutation.mutateAsync({
      id: rulesTarget.value.id,
      ruleIds: selectedRuleIds.value,
    })
    toast.success('Data scope rules updated')
    rulesDialogOpen.value = false
  }
  catch (error) {
    toast.error(getErrorMessage(error))
  }
}
</script>

<template>
  <BasicPage title="Data Scopes" description="Manage data permission scopes." sticky>
    <template #actions>
      <UiButton @click="openCreate">
        <Plus class="mr-2 size-4" />
        New Scope
      </UiButton>
    </template>

    <div class="overflow-x-auto">
      <DataScopeDataTable :data="dataScopes" :columns="columns" :loading="isLoading" />
    </div>

    <!-- Create/Edit Dialog -->
    <UiDialog v-model:open="dialogOpen">
      <UiDialogContent>
        <UiDialogHeader>
          <UiDialogTitle>{{ editingScope ? 'Edit Data Scope' : 'New Data Scope' }}</UiDialogTitle>
          <UiDialogDescription>
            {{ editingScope ? 'Update data scope information.' : 'Create a new data scope.' }}
          </UiDialogDescription>
        </UiDialogHeader>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <FormField v-slot="{ componentField }" name="name">
            <UiFormItem>
              <UiFormLabel>Name</UiFormLabel>
              <UiFormControl>
                <UiInput v-bind="componentField" placeholder="Scope name" :disabled="isSaving" />
              </UiFormControl>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <FormField v-slot="{ handleChange, value }" type="checkbox" name="status">
            <UiFormItem class="flex items-center justify-between rounded-lg border p-3">
              <div>
                <UiFormLabel>Status</UiFormLabel>
                <UiFormDescription>Enable this data scope.</UiFormDescription>
              </div>
              <UiFormControl>
                <UiSwitch :checked="value" :disabled="isSaving" @update:checked="handleChange" />
              </UiFormControl>
            </UiFormItem>
          </FormField>

          <UiDialogFooter class="gap-2">
            <UiButton type="button" variant="outline" @click="dialogOpen = false">
              Cancel
            </UiButton>
            <UiButton type="submit" :disabled="isSaving">
              {{ editingScope ? 'Save Changes' : 'Create Scope' }}
            </UiButton>
          </UiDialogFooter>
        </form>
      </UiDialogContent>
    </UiDialog>

    <!-- Rules Dialog -->
    <UiDialog v-model:open="rulesDialogOpen">
      <UiDialogContent class="max-h-[90vh] overflow-y-auto">
        <UiDialogHeader>
          <UiDialogTitle>Configure Rules</UiDialogTitle>
          <UiDialogDescription>
            Select data rules for scope: {{ rulesTarget?.name }}
          </UiDialogDescription>
        </UiDialogHeader>

        <div class="space-y-4">
          <div class="max-h-96 overflow-y-auto rounded-lg border p-4">
            <div v-if="!allRules.length" class="text-center text-muted-foreground">
              No data rules available. Please create data rules first.
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="rule in allRules"
                :key="rule.id"
                class="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50"
              >
                <UiCheckbox
                  :id="`rule-${rule.id}`"
                  :checked="selectedRuleIds.includes(rule.id)"
                  @update:checked="
                    (checked) => {
                      if (checked) {
                        selectedRuleIds.push(rule.id)
                      }
                      else {
                        const index = selectedRuleIds.indexOf(rule.id)
                        if (index > -1) {
                          selectedRuleIds.splice(index, 1)
                        }
                      }
                    }
                  "
                />
                <label :for="`rule-${rule.id}`" class="flex-1 cursor-pointer">
                  <div class="font-medium">{{ rule.name }}</div>
                  <div class="text-sm text-muted-foreground">
                    {{ rule.model }} - {{ rule.column }} {{ rule.operator }} {{ rule.value }}
                  </div>
                </label>
              </div>
            </div>
          </div>

          <UiDialogFooter class="gap-2">
            <UiButton type="button" variant="outline" @click="rulesDialogOpen = false">
              Cancel
            </UiButton>
            <UiButton type="button" :disabled="isSavingRules" @click="handleRulesSave">
              Save Rules
            </UiButton>
          </UiDialogFooter>
        </div>
      </UiDialogContent>
    </UiDialog>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      :is-loading="isDeleting"
      destructive
      confirm-button-text="Delete"
      @confirm="handleDeleteConfirm"
    >
      <template #title> Delete data scope </template>
      <template #description>
        This action cannot be undone. The data scope will be permanently removed.
      </template>
    </ConfirmDialog>
  </BasicPage>
</template>
