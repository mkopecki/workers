import { db } from "../db/db";
import { messages_table } from "../db/schema";
import { eq } from "drizzle-orm";
import type { Message } from "../types";

export const get_message_history = async (
  thread_id: string,
  thread_state_id: string
): Promise<Message[]> => {
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
