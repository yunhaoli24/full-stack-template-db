<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { isAxiosError } from 'axios'
import { Pencil, Plus, PlusCircle, Trash2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import ConfirmDialog from '@/components/confirm-dialog.vue'
import { BasicPage } from '@/components/global-layout'
import { FormField } from '@/components/ui/form'
import {
  useCreateMenuMutation,
  useDeleteMenuMutation,
  useGetMenuTreeQuery,
  useUpdateMenuMutation,
  type MenuPayload,
  type MenuTreeNode,
} from '@/services/api/system/menu/menus.api'

const query = useGetMenuTreeQuery()
const createMutation = useCreateMenuMutation()
const updateMutation = useUpdateMenuMutation()
const deleteMutation = useDeleteMenuMutation()

const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const editingMenu = ref<MenuTreeNode | null>(null)
const deleteTarget = ref<MenuTreeNode | null>(null)

const isSaving = computed(() => createMutation.isPending.value || updateMutation.isPending.value)
const isDeleting = computed(() => deleteMutation.isPending.value)

const menuTypeOptions = [
  { label: 'Directory', value: 0 },
  { label: 'Menu', value: 1 },
  { label: 'Button', value: 2 },
  { label: 'Iframe', value: 3 },
  { label: 'External Link', value: 4 },
] as const
const ROOT_PARENT_VALUE = '__root__'

const menuFormSchema = toTypedSchema(
  z.object({
    title: z.string().trim().min(1, 'Please enter a title.'),
    name: z.string().trim().min(1, 'Please enter a name.'),
    path: z.string().optional(),
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
    icon: z.string().optional(),
    type: z.coerce.number().min(0),
    component: z.string().optional(),
    perms: z.string().optional(),
    status: z.boolean(),
    display: z.boolean(),
    cache: z.boolean(),
    link: z.string().optional(),
    remark: z.string().optional(),
  }),
)

const { handleSubmit, resetForm } = useForm({
  validationSchema: menuFormSchema,
  initialValues: {
    title: '',
    name: '',
    path: '',
    parent_id: ROOT_PARENT_VALUE,
    sort: 0,
    icon: '',
    type: '1',
    component: '',
    perms: '',
    status: true,
    display: true,
    cache: true,
    link: '',
    remark: '',
  },
})

const menuTree = computed(() => query.data.value?.data ?? [])

function flattenMenu(nodes: MenuTreeNode[], depth = 0): Array<{ node: MenuTreeNode; depth: number }> {
  const result: Array<{ node: MenuTreeNode; depth: number }> = []
  nodes.forEach((node) => {
    result.push({ node, depth })
    if (node.children?.length) {
      result.push(...flattenMenu(node.children, depth + 1))
    }
  })
  return result
}

const flatMenuList = computed(() => flattenMenu(menuTree.value))

const parentOptions = computed(() => [
  { label: 'Root', value: ROOT_PARENT_VALUE },
  ...flatMenuList.value.map(({ node, depth }) => ({
    label: `${depth ? `${'-'.repeat(depth)} ` : ''}${node.title}`,
    value: String(node.id),
  })),
])

watch(dialogOpen, (open) => {
  if (!open) {
    editingMenu.value = null
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

function openCreate(parent?: MenuTreeNode | null) {
  editingMenu.value = null
  dialogOpen.value = true
  resetForm({
    values: {
      title: '',
      name: '',
      path: '',
      parent_id: parent?.id ? String(parent.id) : ROOT_PARENT_VALUE,
      sort: 0,
      icon: '',
      type: '1',
      component: '',
      perms: '',
      status: true,
      display: true,
      cache: true,
      link: '',
      remark: '',
    },
  })
}

function openEdit(menu: MenuTreeNode) {
  editingMenu.value = menu
  dialogOpen.value = true
  resetForm({
    values: {
      title: menu.title,
      name: menu.name,
      path: menu.path ?? '',
      parent_id: menu.parent_id ? String(menu.parent_id) : ROOT_PARENT_VALUE,
      sort: menu.sort ?? 0,
      icon: menu.icon ?? '',
      type: String(menu.type ?? 1),
      component: menu.component ?? '',
      perms: menu.perms ?? '',
      status: menu.status === 1,
      display: menu.display === 1,
      cache: menu.cache === 1,
      link: menu.link ?? '',
      remark: menu.remark ?? '',
    },
  })
}

function requestDelete(menu: MenuTreeNode) {
  deleteTarget.value = menu
  deleteDialogOpen.value = true
}

const onSubmit = handleSubmit(async (values) => {
  const payload: MenuPayload = {
    title: values.title.trim(),
    name: values.name.trim(),
    path: values.path?.trim() || null,
    parent_id: values.parent_id ?? null,
    sort: values.sort ?? 0,
    icon: values.icon?.trim() || null,
    type: values.type ?? 1,
    component: values.component?.trim() || null,
    perms: values.perms?.trim() || null,
    status: values.status ? 1 : 0,
    display: values.display ? 1 : 0,
    cache: values.cache ? 1 : 0,
    link: values.link?.trim() || null,
    remark: values.remark?.trim() || null,
  }

  try {
    if (editingMenu.value) {
      await updateMutation.mutateAsync({ id: editingMenu.value.id, payload })
      toast.success('Menu updated')
    }
    else {
      await createMutation.mutateAsync(payload)
      toast.success('Menu created')
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
    toast.success('Menu deleted')
  }
  catch (error) {
    toast.error(getErrorMessage(error))
  }
  finally {
    deleteDialogOpen.value = false
    deleteTarget.value = null
  }
}

function formatType(type: number) {
  return menuTypeOptions.find((option) => option.value === type)?.label || `Type ${type}`
}
</script>

<template>
  <BasicPage title="Menus" sticky>
    <template #actions>
      <UiButton @click="openCreate(null)">
        <Plus class="mr-2 size-4" />
        New Menu
      </UiButton>
    </template>

    <UiCard>
      <UiCardContent class="py-4">
        <UiTable>
          <UiTableHeader>
            <UiTableRow>
              <UiTableHead>Title</UiTableHead>
              <UiTableHead>Path</UiTableHead>
              <UiTableHead>Type</UiTableHead>
              <UiTableHead>Display</UiTableHead>
              <UiTableHead>Status</UiTableHead>
              <UiTableHead>Sort</UiTableHead>
              <UiTableHead class="text-right">Actions</UiTableHead>
            </UiTableRow>
          </UiTableHeader>
          <UiTableBody>
            <UiTableRow v-for="item in flatMenuList" :key="item.node.id">
              <UiTableCell>
                <span :style="{ paddingLeft: `${item.depth * 16}px` }">{{ item.node.title }}</span>
              </UiTableCell>
              <UiTableCell>{{ item.node.path || '-' }}</UiTableCell>
              <UiTableCell>{{ formatType(item.node.type) }}</UiTableCell>
              <UiTableCell>
                <UiBadge :variant="item.node.display === 1 ? 'default' : 'secondary'">
                  {{ item.node.display === 1 ? 'Shown' : 'Hidden' }}
                </UiBadge>
              </UiTableCell>
              <UiTableCell>
                <UiBadge :variant="item.node.status === 1 ? 'default' : 'secondary'">
                  {{ item.node.status === 1 ? 'Active' : 'Disabled' }}
                </UiBadge>
              </UiTableCell>
              <UiTableCell>{{ item.node.sort }}</UiTableCell>
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
            <UiTableEmpty v-if="!flatMenuList.length" :colspan="7"> No menus found. </UiTableEmpty>
          </UiTableBody>
        </UiTable>
      </UiCardContent>
    </UiCard>

    <UiDialog v-model:open="dialogOpen">
      <UiDialogContent class="max-h-[90vh] overflow-y-auto">
        <UiDialogHeader>
          <UiDialogTitle>{{ editingMenu ? 'Edit Menu' : 'New Menu' }}</UiDialogTitle>
          <UiDialogDescription> Configure navigation entries and permissions. </UiDialogDescription>
        </UiDialogHeader>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <div class="grid gap-4 md:grid-cols-2">
            <FormField v-slot="{ componentField }" name="title">
              <UiFormItem>
                <UiFormLabel>Title</UiFormLabel>
                <UiFormControl>
                  <UiInput v-bind="componentField" placeholder="Menu title" :disabled="isSaving" />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="name">
              <UiFormItem>
                <UiFormLabel>Name</UiFormLabel>
                <UiFormControl>
                  <UiInput v-bind="componentField" placeholder="Unique name" :disabled="isSaving" />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <FormField v-slot="{ componentField }" name="path">
              <UiFormItem>
                <UiFormLabel>Path</UiFormLabel>
                <UiFormControl>
                  <UiInput
                    v-bind="componentField"
                    placeholder="/system/menu"
                    :disabled="isSaving"
                  />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="parent_id">
              <UiFormItem>
                <UiFormLabel>Parent Menu</UiFormLabel>
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
          </div>

          <div class="grid gap-4 md:grid-cols-3">
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
                        v-for="option in menuTypeOptions"
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

            <FormField v-slot="{ componentField }" name="sort">
              <UiFormItem>
                <UiFormLabel>Sort</UiFormLabel>
                <UiFormControl>
                  <UiInput v-bind="componentField" type="number" min="0" :disabled="isSaving" />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="icon">
              <UiFormItem>
                <UiFormLabel>Icon</UiFormLabel>
                <UiFormControl>
                  <UiInput v-bind="componentField" placeholder="icon-key" :disabled="isSaving" />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <FormField v-slot="{ componentField }" name="component">
              <UiFormItem>
                <UiFormLabel>Component</UiFormLabel>
                <UiFormControl>
                  <UiInput
                    v-bind="componentField"
                    placeholder="Component path"
                    :disabled="isSaving"
                  />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="perms">
              <UiFormItem>
                <UiFormLabel>Permission</UiFormLabel>
                <UiFormControl>
                  <UiInput
                    v-bind="componentField"
                    placeholder="sys:menu:add"
                    :disabled="isSaving"
                  />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <FormField v-slot="{ componentField }" name="link">
              <UiFormItem>
                <UiFormLabel>Link</UiFormLabel>
                <UiFormControl>
                  <UiInput v-bind="componentField" placeholder="https://..." :disabled="isSaving" />
                </UiFormControl>
                <UiFormMessage />
              </UiFormItem>
            </FormField>

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
          </div>

          <div class="grid gap-3 md:grid-cols-3">
            <FormField v-slot="{ handleChange, value }" type="checkbox" name="status">
              <UiFormItem class="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <UiFormLabel>Status</UiFormLabel>
                  <UiFormDescription>Enable this menu.</UiFormDescription>
                </div>
                <UiFormControl>
                  <UiSwitch :checked="value" :disabled="isSaving" @update:checked="handleChange" />
                </UiFormControl>
              </UiFormItem>
            </FormField>

            <FormField v-slot="{ handleChange, value }" type="checkbox" name="display">
              <UiFormItem class="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <UiFormLabel>Display</UiFormLabel>
                  <UiFormDescription>Show in sidebar menu.</UiFormDescription>
                </div>
                <UiFormControl>
                  <UiSwitch :checked="value" :disabled="isSaving" @update:checked="handleChange" />
                </UiFormControl>
              </UiFormItem>
            </FormField>

            <FormField v-slot="{ handleChange, value }" type="checkbox" name="cache">
              <UiFormItem class="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <UiFormLabel>Cache</UiFormLabel>
                  <UiFormDescription>Keep page alive.</UiFormDescription>
                </div>
                <UiFormControl>
                  <UiSwitch :checked="value" :disabled="isSaving" @update:checked="handleChange" />
                </UiFormControl>
              </UiFormItem>
            </FormField>
          </div>

          <UiDialogFooter class="gap-2">
            <UiButton type="button" variant="outline" @click="dialogOpen = false">
              Cancel
            </UiButton>
            <UiButton type="submit" :disabled="isSaving">
              {{ editingMenu ? 'Save Changes' : 'Create Menu' }}
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
      <template #title> Delete menu </template>
      <template #description>
        This action cannot be undone. The menu will be removed if it has no child records.
      </template>
    </ConfirmDialog>
  </BasicPage>
</template>
