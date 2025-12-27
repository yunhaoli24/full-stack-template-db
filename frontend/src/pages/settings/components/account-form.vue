<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { isAxiosError } from 'axios'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  useGetCurrentUserQuery,
  useSendEmailCaptchaMutation,
  useUpdateCurrentUserAvatarMutation,
  useUpdateCurrentUserEmailMutation,
  useUpdateCurrentUserNicknameMutation,
} from '@/services/api/system/user/user.api'

import { accountValidator } from '../validators/account.validator'

const accountFormSchema = toTypedSchema(accountValidator)

const query = useGetCurrentUserQuery()
const updateNicknameMutation = useUpdateCurrentUserNicknameMutation()
const updateAvatarMutation = useUpdateCurrentUserAvatarMutation()
const updateEmailMutation = useUpdateCurrentUserEmailMutation()
const sendEmailCaptchaMutation = useSendEmailCaptchaMutation()

const { handleSubmit, resetForm, values, isSubmitting } = useForm({
  validationSchema: accountFormSchema,
  initialValues: {
    username: '',
    nickname: '',
    avatar: '',
    email: '',
    captcha: '',
  },
})

const currentUser = computed(() => query.data.value?.data)
const loadError = computed(() => (query.error.value ? getErrorMessage(query.error.value) : ''))

const isFormDisabled = computed(() => {
  return (
    query.isLoading.value ||
    isSubmitting.value ||
    updateNicknameMutation.isPending.value ||
    updateAvatarMutation.isPending.value ||
    updateEmailMutation.isPending.value
  )
})

const canSendCaptcha = computed(() => {
  const emailValue = values.email?.trim()
  return Boolean(emailValue) && !isFormDisabled.value && !sendEmailCaptchaMutation.isPending.value
})

watch(
  currentUser,
  (user) => {
    if (!user) {
      return
    }
    resetForm({
      values: {
        username: user.username ?? '',
        nickname: user.nickname ?? '',
        avatar: user.avatar ?? '',
        email: user.email ?? '',
        captcha: '',
      },
    })
  },
  { immediate: true },
)

function getErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    return error.response?.data?.msg || error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Request failed'
}

async function handleSendEmailCaptcha() {
  const emailValue = values.email?.trim()
  if (!emailValue) {
    toast.error('Please enter an email first.')
    return
  }

  try {
    await sendEmailCaptchaMutation.mutateAsync(emailValue)
    toast.success('Verification code sent.')
  }
  catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const onSubmit = handleSubmit(async (formValues) => {
  const user = currentUser.value
  if (!user) {
    toast.error('Unable to load account information.')
    return
  }

  const nickname = formValues.nickname.trim()
  const avatar = formValues.avatar.trim()
  const email = formValues.email.trim()
  const captcha = formValues.captcha?.trim() ?? ''

  const updates: Array<() => Promise<unknown>> = []

  if (nickname !== (user.nickname ?? '')) {
    updates.push(() => updateNicknameMutation.mutateAsync(nickname))
  }

  if (avatar !== (user.avatar ?? '')) {
    updates.push(() => updateAvatarMutation.mutateAsync(avatar))
  }

  if (email !== (user.email ?? '')) {
    if (!email) {
      toast.error('Email cannot be empty.')
      return
    }
    if (!captcha) {
      toast.error('Please enter the verification code sent to your email.')
      return
    }
    updates.push(() => updateEmailMutation.mutateAsync({ email, captcha }))
  }

  if (!updates.length) {
    toast('No changes to update.')
    return
  }

  try {
    for (const update of updates) {
      await update()
    }
    toast.success('Account updated.')
  }
  catch (error) {
    toast.error(getErrorMessage(error))
  }
})
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">Account</h3>
    <p class="text-sm text-muted-foreground">
      Manage your account profile details and contact information.
    </p>
  </div>
  <Separator class="my-4" />
  <p v-if="loadError" class="text-sm text-destructive">
    {{ loadError }}
  </p>
  <form class="space-y-8" @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="username">
      <FormItem>
        <FormLabel>Username</FormLabel>
        <FormControl>
          <Input type="text" disabled v-bind="componentField" />
        </FormControl>
        <FormDescription>Username is used for sign-in and cannot be changed.</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="nickname">
      <FormItem>
        <FormLabel>Nickname</FormLabel>
        <FormControl>
          <Input
            type="text"
            placeholder="Your nickname"
            :disabled="isFormDisabled"
            v-bind="componentField"
          />
        </FormControl>
        <FormDescription>This name will be shown across the dashboard.</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="avatar">
      <FormItem>
        <FormLabel>Avatar URL</FormLabel>
        <FormControl>
          <Input
            type="url"
            placeholder="https://example.com/avatar.png"
            :disabled="isFormDisabled"
            v-bind="componentField"
          />
        </FormControl>
        <FormDescription>Paste the URL of an image to update your avatar.</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="email">
      <FormItem>
        <FormLabel>Email</FormLabel>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="flex-1">
            <FormControl>
              <Input
                type="email"
                placeholder="you@example.com"
                :disabled="isFormDisabled"
                v-bind="componentField"
              />
            </FormControl>
          </div>
          <Button
            type="button"
            variant="outline"
            :disabled="!canSendCaptcha"
            @click="handleSendEmailCaptcha"
          >
            Send code
          </Button>
        </div>
        <FormDescription
          >We will send a verification code before updating your email.</FormDescription
        >
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="captcha">
      <FormItem>
        <FormLabel>Verification code</FormLabel>
        <FormControl>
          <Input
            type="text"
            placeholder="Enter the code"
            :disabled="isFormDisabled"
            v-bind="componentField"
          />
        </FormControl>
        <FormDescription>Enter the code sent to your email address.</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="flex justify-start">
      <Button type="submit" :disabled="isFormDisabled"> Update account </Button>
    </div>
  </form>
</template>
