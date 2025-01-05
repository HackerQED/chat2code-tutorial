"use client";

import { ChatInputWrapper } from "@/components/chat/ChatInputWrapper";
import { SplitLayout } from "@/components/layout/SplitLayout";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { Tabs } from "@/components/workspace/Tabs";
import { useMessageParser } from "@/lib/ai/client/hooks/useMessageParser";
import { useChat } from "ai/react";
import { useEffect } from "react";

export default function HomePage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
    });
  const { parsedMessages, parseMessages } = useMessageParser();

  useEffect(() => {
    parseMessages(messages, isLoading);
  }, [messages, isLoading, parseMessages]);

  useEffect(() => {
    // TODO: this is super unefficient
    console.log(parsedMessages);
  }, [parsedMessages]);

  return (
    <SplitLayout
      leftPanel={
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-auto">
            <ChatMessageList>
              {messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  variant={message.role === "user" ? "sent" : "received"}
                >
                  {message.role === "assistant" && (
                    <ChatBubbleAvatar src="/bot-avatar.png" fallback="AI" />
                  )}
                  <ChatBubbleMessage>{message.content}</ChatBubbleMessage>
                </ChatBubble>
              ))}
            </ChatMessageList>
          </div>
          <div className="border-t p-4">
            <ChatInputWrapper
              value={input}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              placeholder="Type a message..."
              disabled={isLoading}
            />
          </div>
        </div>
      }
      rightPanel={<Tabs />}
    />
  );
}
