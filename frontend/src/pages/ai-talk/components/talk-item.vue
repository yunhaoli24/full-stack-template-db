<script lang="ts" setup>
import MarkdownRender from 'markstream-vue'

import { cn } from '@/lib/utils'

import type { IMessage } from '../types'

import ReplyCopy from './reply-copy.vue'
import ReplyRefresh from './reply-refresh.vue'
import ThumbDown from './thumb-down.vue'
import ThumbUp from './thumb-up.vue'

interface Props {
  talk: IMessage
}

const { talk } = defineProps<Props>()
const type = computed(() => talk.role === 'user' ? 'self' : 'robot')
const isLoading = computed(() => type.value === 'robot' && !talk.content)
</script>

<template>
  <div
    :class="cn(
      'text-popover-foreground w-fit',
      type === 'self' ? 'ml-auto' : 'mr-auto',
    )"
  >
    <div>
      <!-- AI 回复：无背景装饰 -->
      <template v-if="type === 'robot'">
        <div v-if="isLoading" class="flex items-center gap-2">
          <UiSpinner class="size-4" />
          <span class="text-sm text-muted-foreground">Thinking...</span>
        </div>
        <MarkdownRender v-else :content="talk.content" />
      </template>

      <!-- 用户输入：保持原有样式 -->
      <p v-else class="whitespace-pre-wrap p-4 rounded-lg bg-primary text-primary-foreground">
        {{ talk.content }}
      </p>

      <!-- 操作按钮 -->
      <div v-if="type !== 'self' && !isLoading">
        <div class="flex items-center gap-2 mt-2">
          <ReplyCopy :content="talk.content" />
          <ReplyRefresh />
          <ThumbUp />
          <ThumbDown />
        </div>
      </div>
    </div>
  </div>
</template>
