import type { messages_table } from "@src/db/schema";
import { thread_manager } from "@src/threads/thread_manager";
import type { Message } from "@src/types";
import cuid from "cuid";
import OpenAI from "openai";

export const openai_client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const create_stream_completion = async ({
  thread_id,
  thread_state_id,
  messages,
  model,
  model_args,
}: {
  thread_id: string;
  thread_state_id: string;
  messages: Message[];
  model: string;
  model_args?: any;
}) => {
  const openai_messages = messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  const message: typeof messages_table.$inferInsert = {
    id: cuid(),
    created_at: new Date(),
    thread_id,
    thread_state_id,
    author: model,
    role: "assistant",
    status: "generating",
    version: 0,
    content: "",
  };
  await thread_manager.create_message(message);

  const completion_stream = await openai_client.chat.completions.create({
    model: model,
    messages: openai_messages,
    stream: true,
    ...model_args,
  });

  let completion = "";
  let i = 1;
  for await (const chunk of completion_stream) {
    if (chunk.choices[0]?.delta?.content) {
      const delta = chunk.choices[0].delta.content;
      completion += delta;
      void thread_manager.append_generating_message_token(
        thread_id,
        thread_state_id,
        message.id,
        delta,
        i
      );
      i++;
    }
  }

  await thread_manager.complete_generating_message(
    thread_id,
    message.id,
    completion
  );
};

export const openai_utils = { create_stream_completion };
