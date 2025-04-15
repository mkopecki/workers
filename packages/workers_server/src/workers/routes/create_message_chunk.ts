import { db } from "@src/db";
import { messages_table, threads_table } from "@src/db/schema";
import { thread_event_manager } from "@src/logic/thread_event_manager";
import type { MessageTokenGeneratedEvent } from "@src/types";
import cuid from "cuid";
import { eq } from "drizzle-orm";
import type { H } from "hono/types";
import { z } from "zod";

const create_message_chunk_data = z.object({
  message_id: z.string(),

  run_id: z.string(),
  thread_state_id: z.string(),

  author: z.string(),
  content_chunk: z.any(),

  version: z.number(),
});

export const create_message_chunk: H = async c => {
  const thread_id = c.req.param("thread_id");
  const data = await c.req.json<z.infer<typeof create_message_chunk_data>>();
  create_message_chunk_data.parse(data);
  const {
    run_id,
    content_chunk,
    author,
    message_id,
    thread_state_id,
    version,
  } = data;

  // send event to the client
  //create_thread_message_data
  const event: MessageTokenGeneratedEvent = {
    id: cuid(),
    type: "message_token_generated",
    data: {
      thread_id,
      thread_state_id,
      message_id,
      token: content_chunk,
      version,
    },
  };
  thread_event_manager.broadcast(thread_id, event);

  // update the database
  const messages = await db
    .select()
    .from(messages_table)
    .where(eq(messages_table.id, message_id));

  if (messages.length !== 0) {
    const [message] = messages;
    await db
      .update(messages_table)
      .set({
        content: { text: message.content + content_chunk },
      })
      .where(eq(messages_table.id, message_id));
  }

  return c.text("success");
};
