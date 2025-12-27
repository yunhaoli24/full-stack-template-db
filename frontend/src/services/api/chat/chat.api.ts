import { useAxios } from "@/composables/use-axios";
import pinia from "@/plugins/pinia/setup";
import { useAuthStore } from "@/stores/auth";
import env from "@/utils/env";

import type { IChatCompletionPayload, IMessage } from "@/services/types/chat";

export type { IChatCompletionPayload, IMessage };

/**
 * Send chat completion request with streaming support
 * Uses fetch API for proper SSE handling
 * @param payload - Chat completion payload
 * @param onChunk - Callback for each chunk of streamed response
 * @param onError - Callback for errors
 * @returns Promise that resolves when stream is complete
 */
export async function streamChatCompletion(
  payload: IChatCompletionPayload,
  onChunk: (chunk: string) => void,
  onError?: (error: Error) => void,
): Promise<void> {
  const authStore = useAuthStore(pinia);
  const token = authStore.accessToken;

  const baseUrl = env.VITE_SERVER_API_URL + env.VITE_SERVER_API_PREFIX;
  const url = `${baseUrl}/chat/completions`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith(":")) {
          continue;
        }

        if (trimmedLine === "data: [DONE]") {
          break;
        }

        if (trimmedLine.startsWith("data: ")) {
          try {
            const jsonStr = trimmedLine.slice(6);
            const jsonData = JSON.parse(jsonStr);

            if (jsonData.choices && jsonData.choices[0]?.delta?.content) {
              onChunk(jsonData.choices[0].delta.content);
            }
          } catch (e) {
            console.error("Failed to parse SSE data:", e);
          }
        }
      }
    }
  } catch (error) {
    if (onError) {
      onError(error as Error);
    } else {
      throw error;
    }
  }
}

/**
 * Send chat completion request without streaming
 * @param payload - Chat completion payload
 * @returns Promise with the complete response
 */
export async function chatCompletion(
  payload: IChatCompletionPayload,
): Promise<{ message: { role: string; content: string } }> {
  const { axiosInstance } = useAxios();

  const response = await axiosInstance.post("/chat/completions", {
    ...payload,
    stream: false,
  });

  return response.data;
}
