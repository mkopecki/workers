import { thread_manager } from "@src/thread_manager";
import {
  messages_table,
  thread_states_table,
  threads_table,
} from "../db/schema";
import cuid from "cuid";
import type { H } from "hono/types";
import { db } from "@src/db/db";
import { eq } from "drizzle-orm";

export type CreateMessageArgs = {
  current_thread_state_id: string;
  content: string;
};

export const create_message: H = async c => {
  const thread_id = c.req.param("id");
  const data = await c.req.json<CreateMessageArgs>();

  // permission check
  const [thread] = await db
    .select()
    .from(threads_table)
    .where(eq(threads_table.id, thread_id));
  const user_id = c.get("jwtPayload")["id"];
  if (user_id !== thread.user_id) {
    return c.json({ message: "Not found." }, 404);
  }

  // create new thread state
  const thread_state: typeof thread_states_table.$inferInsert = {
    id: cuid(),
    created_at: new Date(),
    thread_id,
    previous_thread_state_id: data.current_thread_state_id,
  };

  await thread_manager.create_thread_state(thread_state);
  console.log(`created thread_state ${thread_state.id}`);

  const user_message: typeof messages_table.$inferInsert = {
    id: cuid(),
    role: "user",
    created_at: new Date(),

    thread_state_id: thread_state.id,

    author: user_id,
    content: data.content,
    thread_id: thread_id,
    status: "done",
  };

  await thread_manager.create_message(user_message);
  console.log(`created message for thread ${thread_id}`);

  return c.json(thread_state);
};
