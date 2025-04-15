import type { H } from "hono/types";
import { runs_table, thread_states_table, threads_table } from "@src/db/schema";
import cuid from "cuid";
import { db } from "@src/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import type { ThreadStateCreatedEvent } from "@src/types";
import { thread_event_manager } from "@src/logic/thread_event_manager";

const create_run_data = z.object({
  thread_id: z.string(),
  current_thread_state_id: z.string(),
});

export const create_run: H = async c => {
  const data = await c.req.json<typeof create_run_data._type>();
  create_run_data.parse(data);

  // get thread
  const [thread] = await db
    .select()
    .from(threads_table)
    .where(eq(threads_table.id, data.thread_id));
  console.log(thread);

  // permission check
  const user_id = c.get("jwtPayload")["id"];
  if (user_id !== thread.user_id) {
    return c.json({ message: "Not found." }, 404);
  }

  // create thread state
  const thread_state: typeof thread_states_table.$inferInsert = {
    id: cuid(),
    created_at: new Date(),
    thread_id: thread.id,
    previous_thread_state_id: data.current_thread_state_id,
  };
  await db.insert(thread_states_table).values(thread_state);
  const thread_state_created_event: ThreadStateCreatedEvent = {
    id: cuid(),
    type: "thread_state_created",
    data: { thread_state: thread_state },
  };
  thread_event_manager.broadcast(
    thread_state.thread_id,
    thread_state_created_event
  );

  // create run in datbase
  const run: typeof runs_table.$inferInsert = {
    id: cuid(),
    created_at: new Date(),

    worker_id: thread.worker_id,
    config: thread.worker_config,
    args: {
      thread_id: data.thread_id,
      thread_state_id: thread_state.id,
    },

    status: "queued",
  };
  await db.insert(runs_table).values(run);

  return c.json(thread_state);
};
