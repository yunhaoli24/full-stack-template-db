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
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useGetRolesQuery,
  useUpdateRoleMutation,
  type RoleDetail,
  type CreateRolePayload,
  type UpdateRolePayload,
} from '@/services/api/roles.api'

const query = useGetRolesQuery()
const createMutation = useCreateRoleMutation()
const updateMutation = useUpdateRoleMutation()
const deleteMutation = useDeleteRoleMutation()

const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const editingRole = ref<RoleDetail | null>(null)
const deleteTarget = ref<RoleDetail | null>(null)

const isSaving = computed(() => createMutation.isPending.value || updateMutation.isPending.value)
const isDeleting = computed(() => deleteMutation.isPending.value)

const roleFormSchema = toTypedSchema(
  z.object({
    name: z.string().trim().min(1, 'Please enter a role name.'),
    status: z.coerce.number().min(0).max(1),
    is_filter_scopes: z.boolean(),
    remark: z.string().optional(),
  }),
)

const { handleSubmit: handleCreateSubmit, resetForm: resetCreateForm } = useForm({
  validationSchema: roleFormSchema,
  initialValues: {
    name: '',
    status: 1,
    is_filter_scopes: true,
    remark: '',
  },
})

const { handleSubmit: handleUpdateSubmit, resetForm: resetUpdateForm } = useForm({
  validationSchema: roleFormSchema,
  initialValues: {
    name: '',
    status: 1,
    is_filter_scopes: true,
    remark: '',
  },
})

const roles = computed(() => query.data.value?.data?.items ?? [])

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
  editingRole.value = null
  dialogOpen.value = true
  resetCreateForm({
    values: {
      name: '',
      status: 1,
      is_filter_scopes: true,
      remark: '',
    },
  })
}

function openEdit(role: RoleDetail) {
  editingRole.value = role
  dialogOpen.value = true
  resetUpdateForm({
    values: {
      name: role.name,
      status: role.status,
      is_filter_scopes: role.is_filter_scopes,
      remark: role.remark || '',
    },
  })
}

function requestDelete(role: RoleDetail) {
  deleteTarget.value = role
  deleteDialogOpen.value = true
}

const onCreateSubmit = handleCreateSubmit(async (values) => {
  const payload: CreateRolePayload = {
    name: values.name.trim(),
    status: values.status,
    is_filter_scopes: values.is_filter_scopes,
    remark: values.remark?.trim() || undefined,
  }

  try {
    await createMutation.mutateAsync(payload)
    toast.success('Role created')
    dialogOpen.value = false
  }
  catch (error) {
    toast.error(getErrorMessage(error))
  }
})

const onUpdateSubmit = handleUpdateSubmit(async (values) => {
  if (!editingRole.value)
    return

  const payload: UpdateRolePayload = {
    name: values.name.trim(),
    status: values.status,
    is_filter_scopes: values.is_filter_scopes,
    remark: values.remark?.trim() || undefined,
  }

  try {
    await updateMutation.mutateAsync({ id: editingRole.value.id, payload })
    toast.success('Role updated')
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
    toast.success('Role deleted')
  }
  catch (error) {
    toast.error(getErrorMessage(error))
  }
  finally {
    deleteDialogOpen.value = false
    deleteTarget.value = null
  }
}

watch(dialogOpen, (open) => {
  if (!open) {
    editingRole.value = null
  }
})
</script>

<template>
  <BasicPage title="Roles" description="Manage system roles and permissions." sticky>
    <template #actions>
      <UiButton @click="openCreate">
        <Plus class="mr-2 size-4" />
        New Role
      </UiButton>
    </template>

    <UiCard>
      <UiCardContent class="py-4">
        <UiTable>
          <UiTableHeader>
            <UiTableRow>
              <UiTableHead>Role Name</UiTableHead>
              <UiTableHead>Status</UiTableHead>
              <UiTableHead>Filter Data Scopes</UiTableHead>
              <UiTableHead>Remark</UiTableHead>
              <UiTableHead>Created Time</UiTableHead>
              <UiTableHead class="text-right">Actions</UiTableHead>
            </UiTableRow>
          </UiTableHeader>
          <UiTableBody>
            <UiTableRow v-for="role in roles" :key="role.id">
              <UiTableCell class="font-medium">
                {{ role.name }}
              </UiTableCell>
              <UiTableCell>
                <UiBadge :variant="role.status === 1 ? 'default' : 'secondary'">
                  {{ role.status === 1 ? 'Active' : 'Disabled' }}
                </UiBadge>
              </UiTableCell>
              <UiTableCell>
                <UiBadge :variant="role.is_filter_scopes ? 'default' : 'outline'">
                  {{ role.is_filter_scopes ? 'Yes' : 'No' }}
                </UiBadge>
              </UiTableCell>
              <UiTableCell class="text-muted-foreground">
                {{ role.remark || '-' }}
              </UiTableCell>
              <UiTableCell class="text-sm text-muted-foreground">
                {{ new Date(role.created_time).toLocaleString() }}
              </UiTableCell>
              <UiTableCell class="text-right space-x-2">
                <UiButton size="sm" variant="ghost" @click="openEdit(role)">
                  <Pencil class="mr-1 size-4" />
                  Edit
                </UiButton>
                <UiButton
                  size="sm"
                  variant="ghost"
                  class="text-destructive"
                  @click="requestDelete(role)"
                >
                  <Trash2 class="mr-1 size-4" />
                  Delete
                </UiButton>
              </UiTableCell>
            </UiTableRow>
            <UiTableEmpty v-if="!roles.length" :colspan="6"> No roles found. </UiTableEmpty>
          </UiTableBody>
        </UiTable>
      </UiCardContent>
    </UiCard>

    <!-- Create/Edit Dialog -->
    <UiDialog v-model:open="dialogOpen">
      <UiDialogContent>
        <UiDialogHeader>
          <UiDialogTitle>{{ editingRole ? 'Edit Role' : 'New Role' }}</UiDialogTitle>
          <UiDialogDescription>
            {{ editingRole ? 'Update role information.' : 'Create a new role.' }}
          </UiDialogDescription>
        </UiDialogHeader>

        <form class="space-y-4" @submit.prevent="editingRole ? onUpdateSubmit() : onCreateSubmit()">
          <FormField v-slot="{ componentField }" name="name">
            <UiFormItem>
              <UiFormLabel>Role Name</UiFormLabel>
              <UiFormControl>
                <UiInput v-bind="componentField" placeholder="Role name" :disabled="isSaving" />
              </UiFormControl>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="status">
            <UiFormItem>
              <UiFormLabel>Status</UiFormLabel>
              <UiSelect v-bind="componentField" :disabled="isSaving">
                <UiFormControl>
                  <UiSelectTrigger>
                    <UiSelectValue placeholder="Select status" />
                  </UiSelectTrigger>
                </UiFormControl>
                <UiSelectContent>
                  <UiSelectGroup>
                    <UiSelectItem :value="1"> Active </UiSelectItem>
                    <UiSelectItem :value="0"> Disabled </UiSelectItem>
                  </UiSelectGroup>
                </UiSelectContent>
              </UiSelect>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="is_filter_scopes">
            <UiFormItem class="flex flex-row items-center justify-between rounded-lg border p-4">
              <div class="space-y-0.5">
                <UiFormLabel>Filter Data Scopes</UiFormLabel>
                <UiFormDescription>
                  Enable data permission filtering for this role
                </UiFormDescription>
              </div>
              <UiFormControl>
                <UiSwitch
                  v-bind="componentField"
                  :checked="componentField.modelValue"
                  :disabled="isSaving"
                />
              </UiFormControl>
            </UiFormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="remark">
            <UiFormItem>
              <UiFormLabel>Remark</UiFormLabel>
              <UiFormControl>
                <UiTextarea
                  v-bind="componentField"
                  placeholder="Optional remarks"
                  :disabled="isSaving"
                  rows="3"
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
              {{ editingRole ? 'Save Changes' : 'Create Role' }}
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
      <template #title> Delete role </template>
      <template #description>
        This action cannot be undone. The role will be permanently removed.
      </template>
    </ConfirmDialog>
  </BasicPage>
</template>
