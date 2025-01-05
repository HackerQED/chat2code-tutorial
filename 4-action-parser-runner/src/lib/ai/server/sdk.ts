import { env } from "@/env";
import { createAnthropic } from "@ai-sdk/anthropic";
import { convertToCoreMessages, type Message, streamText } from "ai";
import { getSystemPrompt } from "./prompts";

const MAX_TOKENS = 4096;

// System prompt to instruct the AI about its role and capabilities

// Initialize Anthropic client
function getAnthropicModel() {
  return createAnthropic({
    apiKey: env.ANTHROPIC_API_KEY,
  })("claude-3-sonnet-20240229");
}

export async function createChatStream(messages: Message[]) {
  return streamText({
    model: getAnthropicModel(),
    system: getSystemPrompt(),
    maxTokens: MAX_TOKENS,
    headers: {
      "anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15",
    },
    messages: convertToCoreMessages(messages),
  });
}
