"use client";

import { Button } from "@/components/ui/button";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { SendHorizontal } from "lucide-react";
import { useRef } from "react";

interface ChatInputWrapperProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit?: (e: React.FormEvent) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInputWrapper({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled,
}: ChatInputWrapperProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} className="relative">
      <ChatInput
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="pr-12"
      />
      <Button
        size="icon"
        type="submit"
        disabled={disabled || !value?.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2"
      >
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </form>
  );
}
