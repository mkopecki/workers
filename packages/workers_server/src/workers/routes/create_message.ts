import { thread_event_manager } from "@src/logic/thread_event_manager";
import { db } from "@src/db";
import { messages_table, runs_table, threads_table } from "@src/db/schema";
import type { Message, MessageCreatedEvent } from "@src/types";
import cuid from "cuid";
import type { H } from "hono/types";
import { z } from "zod";
import { eq } from "drizzle-orm";

const create_thread_message_data = z.object({
  run_id: z.string(),
  thread_state_id: z.string(),

  author: z.string(),
  content: z.any(),
});

export const create_message: H = async c => {
  const thread_id = c.req.param("thread_id");
  const data = await c.req.json<typeof create_thread_message_data._type>();
  create_thread_message_data.parse(data);
  const { run_id, content, author } = data;

  // pull the run
  const [run] = await db
    .select()
    .from(runs_table)
    .where(eq(runs_table.id, run_id));
  const { thread_state_id } = run.args;

  // create new message
  const message: typeof messages_table.$inferInsert = {
    id: cuid(),
    created_at: new Date(),
    thread_id,
    thread_state_id,
    author,
    role: "assistant",
    content: {
      text: content,
    },
  };

  const message_created_event: MessageCreatedEvent = {
    id: cuid(),
    type: "message_created",
    data: {
      message: message as Message,
    },
  };
  thread_event_manager.broadcast(message.thread_id, message_created_event);

  await db.insert(messages_table).values(message);
  await db
    .update(threads_table)
    .set({ updated_at: new Date() })
    .where(eq(threads_table.id, message.thread_id));

  return c.json(message);
};
