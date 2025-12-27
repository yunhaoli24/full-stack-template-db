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
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
  useResetUserPasswordMutation,
  type UserDetail,
  type CreateUserPayload,
  type UpdateUserPayload,
} from '@/services/api/system/user/user.api'
import { useGetDeptTreeQuery, type DeptTreeNode } from '@/services/api/system/dept/depts.api'
import { useGetAllRolesQuery, type RoleDetail } from '@/services/api/system/role/roles.api'

import { createColumns } from './components/columns'
import UserDataTable from './components/data-table.vue'

const query = useGetUsersQuery()
const deptsQuery = useGetDeptTreeQuery()
const rolesQuery = useGetAllRolesQuery()
const createMutation = useCreateUserMutation()
const updateMutation = useUpdateUserMutation()
const deleteMutation = useDeleteUserMutation()
const resetPasswordMutation = useResetUserPasswordMutation()

const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const resetPasswordDialogOpen = ref(false)
const editingUser = ref<UserDetail | null>(null)
const deleteTarget = ref<UserDetail | null>(null)
const resetPasswordTarget = ref<UserDetail | null>(null)

const isSaving = computed(() => createMutation.isPending.value || updateMutation.isPending.value)
const isDeleting = computed(() => deleteMutation.isPending.value)
const isResettingPassword = computed(() => resetPasswordMutation.isPending.value)

const createUserFormSchema = toTypedSchema(
  z.object({
    username: z.string().trim().min(1, 'Please enter a username.'),
    password: z.string().trim().min(6, 'Password must be at least 6 characters.'),
    nickname: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    dept_id: z.coerce.number().min(1, 'Please select a department.'),
    roles: z.array(z.coerce.number()).min(1, 'Please select at least one role.'),
  }),
)

const updateUserFormSchema = toTypedSchema(
  z.object({
    username: z.string().trim().min(1, 'Please enter a username.'),
    nickname: z.string().trim().min(1, 'Please enter a nickname.'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    dept_id: z.coerce.number().min(1, 'Please select a department.'),
    roles: z.array(z.coerce.number()).min(1, 'Please select at least one role.'),
  }),
)

const { handleSubmit: handleCreateSubmit, resetForm: resetCreateForm } = useForm({
  validationSchema: createUserFormSchema,
  initialValues: {
    username: '',
    password: '',
    nickname: '',
    email: '',
    phone: '',
    dept_id: 0,
    roles: [],
  },
})

const { handleSubmit: handleUpdateSubmit, resetForm: resetUpdateForm } = useForm({
  validationSchema: updateUserFormSchema,
  initialValues: {
    username: '',
    nickname: '',
    email: '',
    phone: '',
    dept_id: 0,
    roles: [],
  },
})

const resetPasswordFormSchema = toTypedSchema(
  z.object({
    password: z.string().trim().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().trim().min(6, 'Please confirm the password.'),
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
)

const { handleSubmit: handleResetPasswordSubmit, resetForm: resetPasswordForm } = useForm({
  validationSchema: resetPasswordFormSchema,
  initialValues: {
    password: '',
    confirmPassword: '',
  },
})

const users = computed(() => query.data.value?.data?.items ?? [])
const depts = computed(() => deptsQuery.data.value?.data ?? [])
const allRoles = computed(() => rolesQuery.data.value?.data ?? [])
const isLoading = computed(() => query.isLoading.value)

const columns = computed(() =>
  createColumns({
    onEdit: user => openEdit(user),
    onDelete: user => requestDelete(user),
    onResetPassword: user => openResetPassword(user),
  }),
)

function flattenDepts(nodes: DeptTreeNode[]): DeptTreeNode[] {
  const result: DeptTreeNode[] = []
  nodes.forEach((node) => {
    result.push(node)
    if (node.children?.length) {
      result.push(...flattenDepts(node.children))
    }
  })
  return result
}

const flatDepts = computed(() => flattenDepts(depts.value))

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
  editingUser.value = null
  dialogOpen.value = true
  resetCreateForm({
    values: {
      username: '',
      password: '',
      nickname: '',
      email: '',
      phone: '',
      dept_id: 0,
      roles: [],
    },
  })
}

function openEdit(user: UserDetail) {
  editingUser.value = user
  dialogOpen.value = true
  resetUpdateForm({
    values: {
      username: user.username,
      nickname: user.nickname,
      email: user.email || '',
      phone: user.phone || '',
      dept_id: user.dept_id || 0,
      roles: user.roles?.map(r => r.id) || [],
    },
  })
}

function openResetPassword(user: UserDetail) {
  resetPasswordTarget.value = user
  resetPasswordDialogOpen.value = true
  resetPasswordForm({
    values: {
      password: '',
      confirmPassword: '',
    },
  })
}

function requestDelete(user: UserDetail) {
  deleteTarget.value = user
  deleteDialogOpen.value = true
}

const onCreateSubmit = handleCreateSubmit(async (values) => {
  const payload: CreateUserPayload = {
    username: values.username.trim(),
    password: values.password.trim(),
    nickname: values.nickname?.trim(),
    email: values.email?.trim() || undefined,
    phone: values.phone?.trim() || undefined,
    dept_id: values.dept_id,
    roles: values.roles,
  }

  try {
    await createMutation.mutateAsync(payload)
    toast.success('User created')
    dialogOpen.value = false
  }
  catch (error) {
    toast.error(getErrorMessage(error))
  }
})

const onUpdateSubmit = handleUpdateSubmit(async (values) => {
  if (!editingUser.value)
    return

  const payload: UpdateUserPayload = {
    username: values.username.trim(),
    nickname: values.nickname.trim(),
    email: values.email?.trim() || undefined,
    phone: values.phone?.trim() || undefined,
    dept_id: values.dept_id,
    roles: values.roles,
  }

  try {
    await updateMutation.mutateAsync({ id: editingUser.value.id, payload })
    toast.success('User updated')
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
    toast.success('User deleted')
  }
  catch (error) {
    toast.error(getErrorMessage(error))
  }
  finally {
    deleteDialogOpen.value = false
    deleteTarget.value = null
  }
}

const onResetPasswordSubmit = handleResetPasswordSubmit(async (values) => {
  if (!resetPasswordTarget.value) {
    return
  }
  try {
    await resetPasswordMutation.mutateAsync({
      id: resetPasswordTarget.value.id,
      password: values.password.trim(),
    })
    toast.success('Password reset successfully')
    resetPasswordDialogOpen.value = false
  }
  catch (error) {
    toast.error(getErrorMessage(error))
  }
})

watch(dialogOpen, (open) => {
  if (!open) {
    editingUser.value = null
  }
})
</script>

<template>
  <BasicPage title="Users" description="Manage system users and permissions." sticky>
    <template #actions>
      <UiButton @click="openCreate">
        <Plus class="mr-2 size-4" />
        New User
      </UiButton>
    </template>

    <div class="overflow-x-auto">
      <UserDataTable :data="users" :columns="columns" :loading="isLoading" />
    </div>

    <!-- Create/Edit Dialog -->
    <UiDialog v-model:open="dialogOpen">
      <UiDialogContent class="max-h-[90vh] overflow-y-auto">
        <UiDialogHeader>
          <UiDialogTitle>{{ editingUser ? 'Edit User' : 'New User' }}</UiDialogTitle>
          <UiDialogDescription>
            {{ editingUser ? 'Update user information.' : 'Create a new user account.' }}
          </UiDialogDescription>
        </UiDialogHeader>

        <form v-if="!editingUser" class="space-y-4" @submit.prevent="onCreateSubmit">
          <FormField v-slot="{ componentField }" name="username">
            <UiFormItem>
              <UiFormLabel>Username</UiFormLabel>
              <UiFormControl>
                <UiInput v-bind="componentField" placeholder="Username" :disabled="isSaving" />
              </UiFormControl>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="password">
            <UiFormItem>
              <UiFormLabel>Password</UiFormLabel>
              <UiFormControl>
                <UiInput
                  v-bind="componentField"
                  type="password"
                  placeholder="Password"
                  :disabled="isSaving"
                />
              </UiFormControl>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="nickname">
            <UiFormItem>
              <UiFormLabel>Nickname</UiFormLabel>
              <UiFormControl>
                <UiInput v-bind="componentField" placeholder="Nickname" :disabled="isSaving" />
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
                  placeholder="Email"
                  :disabled="isSaving"
                />
              </UiFormControl>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="phone">
            <UiFormItem>
              <UiFormLabel>Phone</UiFormLabel>
              <UiFormControl>
                <UiInput v-bind="componentField" placeholder="Phone" :disabled="isSaving" />
              </UiFormControl>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="dept_id">
            <UiFormItem>
              <UiFormLabel>Department</UiFormLabel>
              <UiSelect v-bind="componentField" :disabled="isSaving">
                <UiFormControl>
                  <UiSelectTrigger>
                    <UiSelectValue placeholder="Select department" />
                  </UiSelectTrigger>
                </UiFormControl>
                <UiSelectContent>
                  <UiSelectGroup>
                    <UiSelectItem v-for="dept in flatDepts" :key="dept.id" :value="dept.id">
                      {{ dept.name }}
                    </UiSelectItem>
                  </UiSelectGroup>
                </UiSelectContent>
              </UiSelect>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="roles">
            <UiFormItem>
              <UiFormLabel>Roles</UiFormLabel>
              <UiSelect v-bind="componentField" multiple :disabled="isSaving">
                <UiFormControl>
                  <UiSelectTrigger>
                    <UiSelectValue placeholder="Select roles" />
                  </UiSelectTrigger>
                </UiFormControl>
                <UiSelectContent>
                  <UiSelectGroup>
                    <UiSelectItem v-for="role in allRoles" :key="role.id" :value="role.id">
                      {{ role.name }}
                    </UiSelectItem>
                  </UiSelectGroup>
                </UiSelectContent>
              </UiSelect>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <UiDialogFooter class="gap-2">
            <UiButton type="button" variant="outline" @click="dialogOpen = false">
              Cancel
            </UiButton>
            <UiButton type="submit" :disabled="isSaving"> Create User </UiButton>
          </UiDialogFooter>
        </form>

        <form v-else class="space-y-4" @submit.prevent="onUpdateSubmit">
          <FormField v-slot="{ componentField }" name="username">
            <UiFormItem>
              <UiFormLabel>Username</UiFormLabel>
              <UiFormControl>
                <UiInput v-bind="componentField" placeholder="Username" :disabled="isSaving" />
              </UiFormControl>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="nickname">
            <UiFormItem>
              <UiFormLabel>Nickname</UiFormLabel>
              <UiFormControl>
                <UiInput v-bind="componentField" placeholder="Nickname" :disabled="isSaving" />
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
                  placeholder="Email"
                  :disabled="isSaving"
                />
              </UiFormControl>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="phone">
            <UiFormItem>
              <UiFormLabel>Phone</UiFormLabel>
              <UiFormControl>
                <UiInput v-bind="componentField" placeholder="Phone" :disabled="isSaving" />
              </UiFormControl>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="dept_id">
            <UiFormItem>
              <UiFormLabel>Department</UiFormLabel>
              <UiSelect v-bind="componentField" :disabled="isSaving">
                <UiFormControl>
                  <UiSelectTrigger>
                    <UiSelectValue placeholder="Select department" />
                  </UiSelectTrigger>
                </UiFormControl>
                <UiSelectContent>
                  <UiSelectGroup>
                    <UiSelectItem v-for="dept in flatDepts" :key="dept.id" :value="dept.id">
                      {{ dept.name }}
                    </UiSelectItem>
                  </UiSelectGroup>
                </UiSelectContent>
              </UiSelect>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="roles">
            <UiFormItem>
              <UiFormLabel>Roles</UiFormLabel>
              <UiSelect v-bind="componentField" multiple :disabled="isSaving">
                <UiFormControl>
                  <UiSelectTrigger>
                    <UiSelectValue placeholder="Select roles" />
                  </UiSelectTrigger>
                </UiFormControl>
                <UiSelectContent>
                  <UiSelectGroup>
                    <UiSelectItem v-for="role in allRoles" :key="role.id" :value="role.id">
                      {{ role.name }}
                    </UiSelectItem>
                  </UiSelectGroup>
                </UiSelectContent>
              </UiSelect>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <UiDialogFooter class="gap-2">
            <UiButton type="button" variant="outline" @click="dialogOpen = false">
              Cancel
            </UiButton>
            <UiButton type="submit" :disabled="isSaving"> Save Changes </UiButton>
          </UiDialogFooter>
        </form>
      </UiDialogContent>
    </UiDialog>

    <!-- Reset Password Dialog -->
    <UiDialog v-model:open="resetPasswordDialogOpen">
      <UiDialogContent>
        <UiDialogHeader>
          <UiDialogTitle>Reset Password</UiDialogTitle>
          <UiDialogDescription>
            Reset password for user: {{ resetPasswordTarget?.username }}
          </UiDialogDescription>
        </UiDialogHeader>

        <form class="space-y-4" @submit.prevent="onResetPasswordSubmit">
          <FormField v-slot="{ componentField }" name="password">
            <UiFormItem>
              <UiFormLabel>New Password</UiFormLabel>
              <UiFormControl>
                <UiInput
                  v-bind="componentField"
                  type="password"
                  placeholder="New password"
                  :disabled="isResettingPassword"
                />
              </UiFormControl>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="confirmPassword">
            <UiFormItem>
              <UiFormLabel>Confirm Password</UiFormLabel>
              <UiFormControl>
                <UiInput
                  v-bind="componentField"
                  type="password"
                  placeholder="Confirm password"
                  :disabled="isResettingPassword"
                />
              </UiFormControl>
              <UiFormMessage />
            </UiFormItem>
          </FormField>

          <UiDialogFooter class="gap-2">
            <UiButton type="button" variant="outline" @click="resetPasswordDialogOpen = false">
              Cancel
            </UiButton>
            <UiButton type="submit" :disabled="isResettingPassword"> Reset Password </UiButton>
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
      <template #title> Delete user </template>
      <template #description>
        This action cannot be undone. The user will be permanently removed.
      </template>
    </ConfirmDialog>
  </BasicPage>
</template>
