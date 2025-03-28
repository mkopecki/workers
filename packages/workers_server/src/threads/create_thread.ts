import type { H } from "hono/types";
import { db } from "../db/db";
import { thread_states_table, threads_table } from "../db/schema";
import cuid from "cuid";

export type CreateThreadArgs = {
  name: string;
  worker_id: string;
  worker_config: any;
};

export const create_thread: H = async c => {
  const data = await c.req.json<CreateThreadArgs>();
  const user_id = c.get("jwtPayload")["id"];

  // create thread
  const thread: typeof threads_table.$inferInsert = {
    id: cuid(),
    created_at: new Date(),
    name: data.name,
    worker_id: data.worker_id,
    worker_config: data.worker_config,
    user_id,
  };
  await db.insert(threads_table).values(thread);
  console.log(`created thread ${thread.id}`);

  // create initial thread state
  const thread_state: typeof thread_states_table.$inferInsert = {
    id: cuid(),
    created_at: new Date(),
    thread_id: thread.id,
    previous_thread_state_id: null,
  };
  await db.insert(thread_states_table).values(thread_state);
  console.log(`created thread_state ${thread_state.id}`);

  c.status(200);
  return c.json({ thread, thread_state });
};
