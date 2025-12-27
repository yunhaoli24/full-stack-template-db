<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { isAxiosError } from 'axios'
import { Plus, Trash2, Pencil, PlusCircle } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import ConfirmDialog from '@/components/confirm-dialog.vue'
import { BasicPage } from '@/components/global-layout'
import { FormField } from '@/components/ui/form'
import {
  useCreateDeptMutation,
  useDeleteDeptMutation,
  useGetDeptTreeQuery,
  useUpdateDeptMutation,
  type DeptPayload,
  type DeptTreeNode,
} from '@/services/api/depts.api'

const query = useGetDeptTreeQuery()
const createMutation = useCreateDeptMutation()
const updateMutation = useUpdateDeptMutation()
const deleteMutation = useDeleteDeptMutation()

const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const editingDept = ref<DeptTreeNode | null>(null)
const deleteTarget = ref<DeptTreeNode | null>(null)
const ROOT_PARENT_VALUE = '__root__'

const isSaving = computed(() => createMutation.isPending.value || updateMutation.isPending.value)
const isDeleting = computed(() => deleteMutation.isPending.value)

const deptFormSchema = toTypedSchema(
  z.object({
    name: z.string().trim().min(1, 'Please enter a department name.'),
    parent_id: z.preprocess(
      (value) => {
        if (value === ROOT_PARENT_VALUE || value === '' || value === null || value === undefined) {
          return null
        }
        const parsed = Number(value)
        return Number.isNaN(parsed) ? null : parsed
      },
      z.number().nullable(),
    ),
    sort: z.coerce.number().min(0, 'Sort must be 0 or greater.'),
    leader: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    status: z.boolean(),
  }),
)

const { handleSubmit, resetForm } = useForm({
  validationSchema: deptFormSchema,
  initialValues: {
    name: '',
    parent_id: ROOT_PARENT_VALUE,
    sort: 0,
    leader: '',
    phone: '',
    email: '',
    status: true,
  },
})

const deptTree = computed(() => query.data.value?.data ?? [])

function flattenDept(nodes: DeptTreeNode[], depth = 0): Array<{ node: DeptTreeNode; depth: number }> {
  const result: Array<{ node: DeptTreeNode; depth: number }> = []
  nodes.forEach((node) => {
    result.push({ node, depth })
    if (node.children?.length) {
      result.push(...flattenDept(node.children, depth + 1))
    }
  })
  return result
}

const flatDeptList = computed(() => flattenDept(deptTree.value))

const parentOptions = computed(() => [
  { label: 'Root', value: ROOT_PARENT_VALUE },
  ...flatDeptList.value.map(({ node, depth }) => ({
    label: `${depth ? `${'-'.repeat(depth)} ` : ''}${node.name}`,
    value: String(node.id),
  })),
])

watch(dialogOpen, (open) => {
  if (!open) {
    editingDept.value = null
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

function openCreate(parent?: DeptTreeNode | null) {
  editingDept.value = null
  dialogOpen.value = true
  resetForm({
    values: {
      name: '',
      parent_id: parent?.id ? String(parent.id) : ROOT_PARENT_VALUE,
      sort: 0,
      leader: '',
      phone: '',
      email: '',
      status: true,
    },
  })
}

function openEdit(dept: DeptTreeNode) {
  editingDept.value = dept
  dialogOpen.value = true
  resetForm({
    values: {
      name: dept.name,
      parent_id: dept.parent_id ? String(dept.parent_id) : ROOT_PARENT_VALUE,
      sort: dept.sort ?? 0,
      leader: dept.leader ?? '',
      phone: dept.phone ?? '',
      email: dept.email ?? '',
      status: dept.status === 1,
    },
  })
}

function requestDelete(dept: DeptTreeNode) {
  deleteTarget.value = dept
  deleteDialogOpen.value = true
}

const onSubmit = handleSubmit(async (values) => {
  const payload: DeptPayload = {
    name: values.name.trim(),
    parent_id: values.parent_id ?? null,
    sort: values.sort ?? 0,
    leader: values.leader?.trim() || null,
    phone: values.phone?.trim() || null,
    email: values.email?.trim() || null,
    status: values.status ? 1 : 0,
  }

  try {
    if (editingDept.value) {
      await updateMutation.mutateAsync({ id: editingDept.value.id, payload })
      toast.success('Department updated')
    }
    else {
      await createMutation.mutateAsync(payload)
      toast.success('Department created')
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
    toast.success('Department deleted')
  }
  catch (error) {
    toast.error(getErrorMessage(error))
  }
  finally {
    deleteDialogOpen.value = false
    deleteTarget.value = null
  }
}
</script>

<template>
  <BasicPage title="Departments" description="Manage department hierarchy and assignments." sticky>
    <template #actions>
      <UiButton @click="openCreate(null)">
        <Plus class="mr-2 size-4" />
        New Department
      </UiButton>
    </template>

    <UiCard>
      <UiCardContent class="py-4">
        <UiTable>
          <UiTableHeader>
            <UiTableRow>
              <UiTableHead>Department</UiTableHead>
              <UiTableHead>Leader</UiTableHead>
              <UiTableHead>Phone</UiTableHead>
              <UiTableHead>Email</UiTableHead>
              <UiTableHead>Status</UiTableHead>
              <UiTableHead class="text-right">Actions</UiTableHead>
            </UiTableRow>
          </UiTableHeader>
          <UiTableBody>
            <UiTableRow v-for="item in flatDeptList" :key="item.node.id">
              <UiTableCell>
                <div class="flex items-center gap-2">
                  <span :style="{ paddingLeft: `${item.depth * 16}px` }">{{ item.node.name }}</span>
                </div>
              </UiTableCell>
              <UiTableCell>{{ item.node.leader || '-' }}</UiTableCell>
              <UiTableCell>{{ item.node.phone || '-' }}</UiTableCell>
              <UiTableCell>{{ item.node.email || '-' }}</UiTableCell>
              <UiTableCell>
                <UiBadge :variant="item.node.status === 1 ? 'default' : 'secondary'">
                  {{ item.node.status === 1 ? 'Active' : 'Disabled' }}
                </UiBadge>
              </UiTableCell>
              <UiTableCell class="text-right space-x-2">
                <UiButton size="sm" variant="ghost" @click="openCreate(item.node)">
                  <PlusCircle class="mr-1 size-4" />
                  Add Child
                </UiButton>
                <UiButton size="sm" variant="ghost" @click="openEdit(item.node)">
                  <Pencil class="mr-1 size-4" />
                  Edit
                </UiButton>
                <UiButton
                  size="sm"
                  variant="ghost"
                  class="text-destructive"
                  @click="requestDelete(item.node)"
                >
                  <Trash2 class="mr-1 size-4" />
                  Delete
                </UiButton>
              </UiTableCell>
            </UiTableRow>
            <UiTableEmpty v-if="!flatDeptList.length" colspan="6">
              No departments found.
            </UiTableEmpty>
          </UiTableBody>
        </UiTable>
      </UiCardContent>
    </UiCard>

    <UiDialog v-model:open="dialogOpen">
      <UiDialogContent class="max-h-[90vh] overflow-y-auto">
        <UiDialogHeader>
          <UiDialogTitle>{{ editingDept ? 'Edit Department' : 'New Department' }}</UiDialogTitle>
          <UiDialogDescription> Update department details and hierarchy. </UiDialogDescription>
        </UiDialogHeader>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <FormField v-slot="{ componentField }" name="name">
            <UiFormItem>
              <UiFormLabel>Name</UiFormLabel>
              <UiFormControl>
                <UiInput
                  v-bind="componentField"
                  placeholder="Department name"
                  :disabled="isSaving"
                />
              </UiFormControl>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="parent_id">
            <UiFormItem>
              <UiFormLabel>Parent Department</UiFormLabel>
              <UiSelect v-bind="componentField" :disabled="isSaving">
                <UiFormControl>
                  <UiSelectTrigger>
                    <UiSelectValue placeholder="Select parent" />
                  </UiSelectTrigger>
                </UiFormControl>
                <UiSelectContent>
                  <UiSelectGroup>
                    <UiSelectItem
                      v-for="option in parentOptions"
                      :key="String(option.value)"
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

          <div class="grid gap-4 md:grid-cols-2">
            <FormField v-slot="{ componentField }" name="leader">
              <UiFormItem>
                <UiFormLabel>Leader</UiFormLabel>
                <UiFormControl>
                  <UiInput v-bind="componentField" placeholder="Leader name" :disabled="isSaving" />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="sort">
              <UiFormItem>
                <UiFormLabel>Sort</UiFormLabel>
                <UiFormControl>
                  <UiInput v-bind="componentField" type="number" min="0" :disabled="isSaving" />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <FormField v-slot="{ componentField }" name="phone">
              <UiFormItem>
                <UiFormLabel>Phone</UiFormLabel>
                <UiFormControl>
                  <UiInput
                    v-bind="componentField"
                    placeholder="Phone number"
                    :disabled="isSaving"
                  />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="email">
              <UiFormItem>
                <UiFormLabel>Email</UiFormLabel>
                <UiFormControl>
                  <UiInput
                    v-bind="componentField"
                    type="email"
                    placeholder="Email address"
                    :disabled="isSaving"
                  />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>
          </div>

          <FormField v-slot="{ handleChange, value }" type="checkbox" name="status">
            <UiFormItem class="flex items-center justify-between rounded-lg border p-3">
              <div>
                <UiFormLabel>Status</UiFormLabel>
                <UiFormDescription>Enable or disable this department.</UiFormDescription>
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
              {{ editingDept ? 'Save Changes' : 'Create Department' }}
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
      <template #title> Delete department </template>
      <template #description>
        This action cannot be undone. The department will be removed if it has no child records.
      </template>
    </ConfirmDialog>
  </BasicPage>
</template>
