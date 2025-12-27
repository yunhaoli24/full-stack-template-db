<script lang="ts" setup>
import { nanoid } from 'nanoid'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { Loader } from '@/components/ai-elements/loader'
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import { streamChatCompletion } from '@/services/api/chat/chat.api'
import type { IMessage } from '@/services/types/chat'


type TalkStatus = 'pending' | 'streaming' | 'done' | 'error'
type TalkMessage = IMessage & {
  id: string
  status?: TalkStatus
}

const talks = ref<TalkMessage[]>([])
const requestStatus = ref<'idle' | 'waiting' | 'streaming' | 'error'>('idle')

const isRequestActive = computed(() => requestStatus.value === 'waiting' || requestStatus.value === 'streaming')
const submitStatus = computed(() => {
  if (requestStatus.value === 'waiting') return 'submitted'
  if (requestStatus.value === 'streaming') return 'streaming'
  if (requestStatus.value === 'error') return 'error'
  return undefined
})

function toMessagePayload(excludeId: string): IMessage[] {
  return talks.value
    .filter(talk => talk.id !== excludeId)
    .map(({ role, content }) => ({ role, content }))
}

async function handleSubmit(message: PromptInputMessage) {
  const content = message.text.trim()
  if (!content && message.files.length === 0) return

  const userMessage: TalkMessage = {
    id: nanoid(),
    role: 'user',
    content,
    status: 'done',
  }
  const assistantMessage: TalkMessage = {
    id: nanoid(),
    role: 'assistant',
    content: '',
    status: 'pending',
  }

  talks.value.push(userMessage, assistantMessage)
  requestStatus.value = 'waiting'

  try {
    await streamChatCompletion(
      {
        stream: true,
        messages: toMessagePayload(assistantMessage.id),
      },
      (chunk: string) => {
        const target = talks.value.find(talk => talk.id === assistantMessage.id)
        if (!target) return
        if (target.status === 'pending') {
          target.status = 'streaming'
        }
        target.content += chunk
        requestStatus.value = 'streaming'
      },
      (error: Error) => {
        const target = talks.value.find(talk => talk.id === assistantMessage.id)
        if (target) {
          target.status = 'error'
          target.content = 'Sorry, I encountered an error. Please try again.'
        }
        requestStatus.value = 'error'
        console.error('Chat completion error:', error)
        toast.error('Failed to get response', {
          description: error.message,
        })
      },
    )

    const target = talks.value.find(talk => talk.id === assistantMessage.id)
    if (target && target.status !== 'error') {
      target.status = 'done'
    }
  } finally {
    requestStatus.value = 'idle'
  }
}

function handleInputError(error: { code: string, message: string }) {
  toast.error(error.message)
}
</script>

<template>
  <div class="h-full">
    <div class="flex flex-col h-full">
      <Conversation class="flex-1">
        <ConversationContent>
          <ConversationEmptyState v-if="talks.length === 0" />
          <template v-else>
            <Message v-for="talk in talks" :key="talk.id" :from="talk.role">
              <MessageContent>
                <template v-if="talk.role === 'assistant'">
                  <div
                    v-if="talk.status === 'pending'"
                    class="flex items-center gap-2 text-muted-foreground"
                  >
                    <Loader class="size-4" />
                    <span class="text-sm">Thinking...</span>
                  </div>
                  <MessageResponse v-else :content="talk.content" />
                </template>
                <p v-else class="whitespace-pre-wrap">
                  {{ talk.content }}
                </p>
              </MessageContent>
            </Message>
          </template>
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput
        class="sticky bottom-2 bg-background"
        @submit="handleSubmit"
        @error="handleInputError"
      >
        <PromptInputBody>
          <PromptInputAttachments v-slot="{ file }">
            <PromptInputAttachment :file="file" />
          </PromptInputAttachments>
          <PromptInputTextarea :disabled="isRequestActive" placeholder="Ask, Search or Chat..." />
        </PromptInputBody>

        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger :disabled="isRequestActive" />
              <PromptInputActionMenuContent side="top">
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
          </PromptInputTools>
          <PromptInputSubmit :disabled="isRequestActive" :status="submitStatus" />
        </PromptInputFooter>
      </PromptInput>
    </div>
  </div>
</template>
