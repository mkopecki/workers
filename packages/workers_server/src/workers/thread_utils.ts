import { db } from "@src/db/db";
import { messages_table, threads_table } from "@src/db/schema";
import type { Message } from "@src/types";
import { eq } from "drizzle-orm/sql";
import { openai_client } from "./openai/openai_utils";

// TODO: fix this
export const get_message_history = async ({
  thread_id,
  thread_state_id,
}: {
  thread_id: string;
  thread_state_id: string;
}): Promise<Message[]> => {
  const thread_messages = await db
    .select()
    .from(messages_table)
    .where(eq(messages_table.thread_id, thread_id));

  // walk up message tree
  // let current_message = thread_messages.find((m) => m.id === message_id);
  // const messages: Message[] = [];
  // while (current_message) {
  //   messages.push(current_message);
  //   current_message = thread_messages.find((m) => m.id === current_message?.previous_message_id);
  // }
  //
  // messages.reverse();

  return thread_messages;
};

export const generate_thread_name = async (
  thread_id: string,
  messages: Message[]
): Promise<void> => {
  // load thread
  const [thread] = await db
    .select()
    .from(threads_table)
    .where(eq(threads_table.id, thread_id));

  if (thread.name !== "No Name") return;

  const openai_messages = messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  const completion = await openai_client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      ...openai_messages,
      {
        role: "user",
        content:
          "Create a short few word title that summarizes the topic of this conversation. Only output symbols that belong to the title.",
      },
    ],
  });
  const content = completion.choices[0].message.content;

  await db
    .update(threads_table)
    .set({ name: content })
    .where(eq(threads_table.id, thread_id));
};

export const thread_utils = {
  get_message_history,
  generate_thread_name,
};
