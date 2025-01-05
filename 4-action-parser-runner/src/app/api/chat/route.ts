import { type Message } from "@/lib/ai/client/runtime/types";
import { createChatStream } from "@/lib/ai/server/sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("Received chat request");
    const body = await req.json();
    console.log("Request body:", body);

    const { messages } = body as { messages: Message[] };
    console.log("Extracted messages:", messages);

    const result = await createChatStream(messages);
    console.log("Created chat stream");

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 },
    );
  }
}
