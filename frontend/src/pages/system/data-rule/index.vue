<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { isAxiosError } from 'axios'
import { Pencil, Plus, Trash2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import ConfirmDialog from '@/components/confirm-dialog.vue'
import { BasicPage } from '@/components/global-layout'
import { FormField } from '@/components/ui/form'
import {
  useCreateDataRuleMutation,
  useDeleteDataRuleMutation,
  useGetDataRuleModelsQuery,
  useGetDataRuleModelColumnsQuery,
  useGetDataRulesQuery,
  useUpdateDataRuleMutation,
  type DataRuleDetail,
  type DataRulePayload,
} from '@/services/api/data-rules.api'

const query = useGetDataRulesQuery()
const modelsQuery = useGetDataRuleModelsQuery()
const createMutation = useCreateDataRuleMutation()
const updateMutation = useUpdateDataRuleMutation()
const deleteMutation = useDeleteDataRuleMutation()

const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const editingRule = ref<DataRuleDetail | null>(null)
const deleteTarget = ref<DataRuleDetail | null>(null)
const selectedModel = ref<string>('')

const isSaving = computed(() => createMutation.isPending.value || updateMutation.isPending.value)
const isDeleting = computed(() => deleteMutation.isPending.value)

const operatorOptions = [
  { label: 'AND', value: 0 },
  { label: 'OR', value: 1 },
]

const expressionOptions = [
  { label: '== (Equal)', value: 0 },
  { label: '!= (Not Equal)', value: 1 },
  { label: '> (Greater Than)', value: 2 },
  { label: '>= (Greater or Equal)', value: 3 },
  { label: '< (Less Than)', value: 4 },
  { label: '<= (Less or Equal)', value: 5 },
  { label: 'IN', value: 6 },
  { label: 'NOT IN', value: 7 },
]

const formSchema = toTypedSchema(
  z.object({
    name: z.string().trim().min(1, 'Please enter a name.'),
    model: z.string().trim().min(1, 'Please select a model.'),
    column: z.string().trim().min(1, 'Please select a column.'),
    operator: z.coerce.number(),
    expression: z.coerce.number(),
    value: z.string().trim().min(1, 'Please enter a value.'),
  }),
)

const { handleSubmit, resetForm, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    model: '',
    column: '',
    operator: 0,
    expression: 0,
    value: '',
  },
})

// Watch model changes to fetch columns
watch(
  () => values.model,
  (newModel) => {
    selectedModel.value = newModel
    // Reset column when model changes
    if (editingRule.value === null) {
      resetForm({
        values: {
          ...values,
          column: '',
        },
      })
    }
  },
)

const columnsQuery = useGetDataRuleModelColumnsQuery(computed(() => selectedModel.value))
const modelOptions = computed(() => modelsQuery.data.value?.data ?? [])
const columnOptions = computed(() => columnsQuery.data.value?.data ?? [])

const dataRules = computed(() => query.data.value?.data ?? [])

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
  editingRule.value = null
  selectedModel.value = ''
  dialogOpen.value = true
  resetForm({
    values: {
      name: '',
      model: '',
      column: '',
      operator: 0,
      expression: 0,
      value: '',
    },
  })
}

function openEdit(rule: DataRuleDetail) {
  editingRule.value = rule
  selectedModel.value = rule.model
  dialogOpen.value = true
  resetForm({
    values: {
      name: rule.name,
      model: rule.model,
      column: rule.column,
      operator: Number.parseInt(rule.operator),
      expression: Number.parseInt(rule.expression),
      value: rule.value,
    },
  })
}

function requestDelete(rule: DataRuleDetail) {
  deleteTarget.value = rule
  deleteDialogOpen.value = true
}

const onSubmit = handleSubmit(async (values) => {
  const payload: DataRulePayload = {
    name: values.name.trim(),
    model: values.model.trim(),
    column: values.column.trim(),
    operator: values.operator.toString(),
    expression: values.expression.toString(),
    value: values.value.trim(),
  }

  try {
    if (editingRule.value) {
      await updateMutation.mutateAsync({ id: editingRule.value.id, payload })
      toast.success('Data rule updated')
    }
    else {
      await createMutation.mutateAsync(payload)
      toast.success('Data rule created')
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
    toast.success('Data rule deleted')
  }
  catch (error) {
    toast.error(getErrorMessage(error))
  }
  finally {
    deleteDialogOpen.value = false
    deleteTarget.value = null
  }
}

function formatOperator(operator: string) {
  const num = Number.parseInt(operator)
  return operatorOptions.find((opt) => opt.value === num)?.label || operator
}

function formatExpression(expression: string) {
  const num = Number.parseInt(expression)
  return expressionOptions.find((opt) => opt.value === num)?.label || expression
}
</script>

<template>
  <BasicPage title="Data Rules" description="Manage data permission rules." sticky>
    <template #actions>
      <UiButton @click="openCreate">
        <Plus class="mr-2 size-4" />
        New Rule
      </UiButton>
    </template>

    <UiCard>
      <UiCardContent class="py-4">
        <UiTable>
          <UiTableHeader>
            <UiTableRow>
              <UiTableHead>Name</UiTableHead>
              <UiTableHead>Model</UiTableHead>
              <UiTableHead>Column</UiTableHead>
              <UiTableHead>Operator</UiTableHead>
              <UiTableHead>Expression</UiTableHead>
              <UiTableHead>Value</UiTableHead>
              <UiTableHead>Created Time</UiTableHead>
              <UiTableHead class="text-right">Actions</UiTableHead>
            </UiTableRow>
          </UiTableHeader>
          <UiTableBody>
            <UiTableRow v-for="rule in dataRules" :key="rule.id">
              <UiTableCell>{{ rule.name }}</UiTableCell>
              <UiTableCell>
                <UiBadge variant="outline">{{ rule.model }}</UiBadge>
              </UiTableCell>
              <UiTableCell>{{ rule.column }}</UiTableCell>
              <UiTableCell>
                <UiBadge :variant="rule.operator === '0' ? 'default' : 'secondary'">
                  {{ formatOperator(rule.operator) }}
                </UiBadge>
              </UiTableCell>
              <UiTableCell>
                <UiBadge variant="outline">{{ formatExpression(rule.expression) }}</UiBadge>
              </UiTableCell>
              <UiTableCell class="font-mono text-xs">{{ rule.value }}</UiTableCell>
              <UiTableCell>{{ new Date(rule.created_time).toLocaleString() }}</UiTableCell>
              <UiTableCell class="text-right space-x-2">
                <UiButton size="sm" variant="ghost" @click="openEdit(rule)">
                  <Pencil class="mr-1 size-4" />
                  Edit
                </UiButton>
                <UiButton
                  size="sm"
                  variant="ghost"
                  class="text-destructive"
                  @click="requestDelete(rule)"
                >
                  <Trash2 class="mr-1 size-4" />
                  Delete
                </UiButton>
              </UiTableCell>
            </UiTableRow>
            <UiTableEmpty v-if="!dataRules.length" :colspan="8">
              No data rules found.
            </UiTableEmpty>
          </UiTableBody>
        </UiTable>
      </UiCardContent>
    </UiCard>

    <!-- Create/Edit Dialog -->
    <UiDialog v-model:open="dialogOpen">
      <UiDialogContent class="max-h-[90vh] overflow-y-auto">
        <UiDialogHeader>
          <UiDialogTitle>{{ editingRule ? 'Edit Data Rule' : 'New Data Rule' }}</UiDialogTitle>
          <UiDialogDescription>
            {{ editingRule ? 'Update data rule information.' : 'Create a new data rule.' }}
          </UiDialogDescription>
        </UiDialogHeader>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <FormField v-slot="{ componentField }" name="name">
            <UiFormItem>
              <UiFormLabel>Name</UiFormLabel>
              <UiFormControl>
                <UiInput v-bind="componentField" placeholder="Rule name" :disabled="isSaving" />
              </UiFormControl>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="model">
            <UiFormItem>
              <UiFormLabel>Model</UiFormLabel>
              <UiSelect v-bind="componentField" :disabled="isSaving">
                <UiFormControl>
                  <UiSelectTrigger>
                    <UiSelectValue placeholder="Select a model" />
                  </UiSelectTrigger>
                </UiFormControl>
                <UiSelectContent>
                  <UiSelectGroup>
                    <UiSelectItem v-for="model in modelOptions" :key="model" :value="model">
                      {{ model }}
                    </UiSelectItem>
                  </UiSelectGroup>
                </UiSelectContent>
              </UiSelect>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="column">
            <UiFormItem>
              <UiFormLabel>Column</UiFormLabel>
              <UiSelect v-bind="componentField" :disabled="isSaving || !values.model">
                <UiFormControl>
                  <UiSelectTrigger>
                    <UiSelectValue placeholder="Select a column" />
                  </UiSelectTrigger>
                </UiFormControl>
                <UiSelectContent>
                  <UiSelectGroup>
                    <UiSelectItem v-for="col in columnOptions" :key="col.key" :value="col.key">
                      {{ col.comment ? `${col.key} (${col.comment})` : col.key }}
                    </UiSelectItem>
                  </UiSelectGroup>
                </UiSelectContent>
              </UiSelect>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <div class="grid gap-4 md:grid-cols-2">
            <FormField v-slot="{ componentField }" name="operator">
              <UiFormItem>
                <UiFormLabel>Operator</UiFormLabel>
                <UiSelect v-bind="componentField" :disabled="isSaving">
                  <UiFormControl>
                    <UiSelectTrigger>
                      <UiSelectValue placeholder="Select operator" />
                    </UiSelectTrigger>
                  </UiFormControl>
                  <UiSelectContent>
                    <UiSelectGroup>
                      <UiSelectItem
                        v-for="opt in operatorOptions"
                        :key="opt.value"
                        :value="String(opt.value)"
                      >
                        {{ opt.label }}
                      </UiSelectItem>
                    </UiSelectGroup>
                  </UiSelectContent>
                </UiSelect>
                <UiFormMessage />
              </UiFormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="expression">
              <UiFormItem>
                <UiFormLabel>Expression</UiFormLabel>
                <UiSelect v-bind="componentField" :disabled="isSaving">
                  <UiFormControl>
                    <UiSelectTrigger>
                      <UiSelectValue placeholder="Select expression" />
                    </UiSelectTrigger>
                  </UiFormControl>
                  <UiSelectContent>
                    <UiSelectGroup>
                      <UiSelectItem
                        v-for="opt in expressionOptions"
                        :key="opt.value"
                        :value="String(opt.value)"
                      >
                        {{ opt.label }}
                      </UiSelectItem>
                    </UiSelectGroup>
                  </UiSelectContent>
                </UiSelect>
                <UiFormMessage />
              </UiFormItem>
            </FormField>
          </div>

          <FormField v-slot="{ componentField }" name="value">
            <UiFormItem>
              <UiFormLabel>Value</UiFormLabel>
              <UiFormControl>
                <UiInput v-bind="componentField" placeholder="Rule value" :disabled="isSaving" />
              </UiFormControl>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <UiDialogFooter class="gap-2">
            <UiButton type="button" variant="outline" @click="dialogOpen = false">
              Cancel
            </UiButton>
            <UiButton type="submit" :disabled="isSaving">
              {{ editingRule ? 'Save Changes' : 'Create Rule' }}
            </UiButton>
          </UiDialogFooter>
        </form>
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
      <template #title> Delete data rule </template>
      <template #description>
        This action cannot be undone. The data rule will be permanently removed.
      </template>
    </ConfirmDialog>
  </BasicPage>
</template>
