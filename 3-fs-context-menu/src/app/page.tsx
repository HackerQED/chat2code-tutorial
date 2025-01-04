"use client";

import { SplitLayout } from "@/components/layout/SplitLayout";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { ChatInput } from "@/components/ui/chat/chat-input";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { useState } from "react";
import { WebContainerProvider } from "@/components/shared/WebContainerProvider";
import { Tabs } from "@/components/workspace/Tabs";

export default function HomePage() {
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      content: string;
      role: "user" | "assistant";
    }>
  >([
    {
      id: "1",
      content: "Hello! How can I help you today?",
      role: "assistant",
    },
  ]);

  return (
    <WebContainerProvider>
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
              <ChatInput
                placeholder="Type a message..."
                onChange={(e) => {
                  console.log(e.target.value);
                }}
              />
            </div>
          </div>
        }
        rightPanel={<Tabs />}
      />
    </WebContainerProvider>
  );
}
