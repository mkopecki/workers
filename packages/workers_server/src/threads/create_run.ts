import type { H } from "hono/types";
import { runs_table, thread_states_table, threads_table } from "../db/schema";
import cuid from "cuid";
import { db } from "../db/db";
import { eq } from "drizzle-orm";
import { get_worker } from "../workers";
import { thread_manager } from "./thread_manager";
import { balance } from "@src/balance";

export type CreateRunArgs = {
  thread_id: string;
  current_thread_state_id: string;
};

const RUN_COST = 5;

export const create_run: H = async c => {
  const data = await c.req.json<CreateRunArgs>();

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

  // balance check
  await balance.verify(user_id, RUN_COST);

  const thread_state: typeof thread_states_table.$inferInsert = {
    id: cuid(),
    created_at: new Date(),
    thread_id: thread.id,
    previous_thread_state_id: data.current_thread_state_id,
  };
  await thread_manager.create_thread_state(thread_state);

  // create run in datbase
  const run: typeof runs_table.$inferInsert = {
    id: cuid(),
    created_at: new Date(),

    thread_state_id: thread_state.id,
    thread_id: data.thread_id,
    worker_id: thread.worker_id,

    status: "processing",
  };
  await thread_manager.create_run(run);

  try {
    const worker = get_worker(run.worker_id);
    await worker.run(thread.worker_config, run);

    await db
      .update(runs_table)
      .set({
        status: "done",
      })
      .where(eq(runs_table.id, run.id));

    await balance.modify(user_id, -RUN_COST);

    c.status(200);
    return c.json(thread_state);
  } catch (e) {
    console.error(e);

    await db
      .update(runs_table)
      .set({
        status: "error",
      })
      .where(eq(runs_table.id, run.id));

    c.status(500);
    return c.text("internal error");
  }
};
