import { db } from "@src/db";
import { messages_table, threads_table } from "@src/db/schema";
import { eq } from "drizzle-orm/sql";
import OpenAI from "openai";

const openai_client = new OpenAI();

export const generate_thread_name = async (
  thread_id: string
): Promise<void> => {
  // load thread
  const [thread] = await db
    .select()
    .from(threads_table)
    .where(eq(threads_table.id, thread_id));

  const messages = await db
    .select()
    .from(messages_table)
    .where(eq(messages_table.thread_id, thread_id));

  if (thread.name !== "No Name" || messages.length < 2) return;

  const openai_messages = messages.map(m => ({
    role: m.role,
    content: m.content.text,
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
