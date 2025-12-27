<script lang="ts" setup>
import { toast } from 'vue-sonner'

import type { IMessage } from '@/services/types/chat'
import { streamChatCompletion } from '@/services/api/chat/chat.api'

import TalkFooter from './components/talk-footer.vue'
import TalkList from './components/talk-list.vue'
import { exampleTalks } from './data/talks'

const talks = ref<IMessage[]>([...exampleTalks])
const isLoading = ref(false)

function handleSubmit(content: string) {
  talks.value.push({
    role: 'user',
    content,
  })

  isLoading.value = true

  // Add a placeholder for the assistant's response
  const assistantMessageIndex = talks.value.length
  talks.value.push({
    role: 'system',
    content: '',
  })

  streamChatCompletion(
    {
      stream: true,
      messages: talks.value.slice(0, -1), // Exclude the placeholder
    },
    (chunk: string) => {
      // markstream-vue handles streaming efficiently, just update content directly
      talks.value[assistantMessageIndex].content += chunk
    },
    (error: Error) => {
      console.error('Chat completion error:', error)
      toast.error('Failed to get response', {
        description: error.message,
      })
      talks.value[assistantMessageIndex].content = 'Sorry, I encountered an error. Please try again.'
      isLoading.value = false
    },
  ).then(() => {
    isLoading.value = false
  })
}
</script>

<template>
  <div class="h-full">
    <div class="flex flex-col h-full">
      <main class="flex-1 overflow-y-auto">
        <TalkList :talks="talks" />
      </main>
      <TalkFooter
        class="sticky bottom-2 bg-background"
        :disabled="isLoading"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>
