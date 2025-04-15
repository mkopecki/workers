import { db } from "@src/db";
import { messages_table } from "@src/db/schema";
import type { H } from "hono/types";
import { eq } from "drizzle-orm";

// TODO: walk up message tree
export const get_thread: H = async c => {
  const thread_id = c.req.param("id");
  const thread_state_id = c.req.param("thread_state_id");

  const thread_messages = await db
    .select()
    .from(messages_table)
    .where(eq(messages_table.thread_id, thread_id));

  return c.json(thread_messages);
};
