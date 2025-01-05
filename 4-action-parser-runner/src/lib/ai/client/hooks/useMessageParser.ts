import type { Message } from "ai";
import { useCallback, useRef, useState } from "react";
import { useActionRunner } from "../context/ActionRunnerContext";
import { StreamingMessageParser } from "../runtime/message-parser";

export function useMessageParser() {
  const actionRunner = useActionRunner();
  const [parsedMessages, setParsedMessages] = useState<Record<number, string>>(
    {},
  );
  const processedMessageIds = useRef(new Set<string>());

  const messageParser = useRef(
    new StreamingMessageParser({
      callbacks: {
        onArtifactOpen: (data) => {
          console.log("[useMessageParser] onArtifactOpen", data);
        },
        onArtifactClose: (data) => {
          console.log("[useMessageParser] onArtifactClose", data);
        },
        onActionOpen: (data) => {
          console.log("[useMessageParser] onActionOpen", data.action);
          actionRunner.addAction(data);
        },
        onActionClose: (data) => {
          console.log("[useMessageParser] onActionClose", data.action);
          void actionRunner.runAction(data);
        },
      },
    }),
  ).current;

  const parseMessages = useCallback(
    (messages: Message[], isLoading: boolean) => {
      for (const [index, message] of messages.entries()) {
        if (message.role === "assistant") {
          if (!isLoading && processedMessageIds.current.has(message.id)) {
            console.log(
              `[useMessageParser] Message ${message.id} already processed, skipping`,
            );
            continue;
          }

          const newParsedContent = messageParser.parse(
            message.id,
            message.content,
          );

          if (!isLoading) {
            processedMessageIds.current.add(message.id);
            if (process.env.NODE_ENV !== "production") {
              console.log(
                `[useMessageParser] Message ${message.id} processed and marked as complete`,
              );
            }
          }

          setParsedMessages((prevParsed) => ({
            ...prevParsed,
            [index]: isLoading
              ? (prevParsed[index] || "") + newParsedContent
              : newParsedContent,
          }));
        }
      }
    },
    [messageParser],
  );

  const reset = useCallback(() => {
    processedMessageIds.current.clear();
    setParsedMessages({});
    messageParser.reset();
  }, [messageParser]);

  return { parsedMessages, parseMessages, reset };
}
