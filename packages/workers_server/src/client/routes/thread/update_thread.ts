import { db } from "@src/db";
import { threads_table } from "@src/db/schema";
import type { H } from "hono/types";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const update_thread: H = async c => {
  const thread_id = c.req.param("id");
  const payload = await c.req.json();

  console.log(payload.worker_config);
  // check thread permissions
  const [thread] = await db
    .select()
    .from(threads_table)
    .where(eq(threads_table.id, thread_id));
  const user_id = c.get("jwtPayload")["id"];
  if (user_id !== thread.user_id) {
    return c.json({ message: "Not found." }, 404);
  }

  // validate payload
  // const worker = get_worker(thread.worker_id);
  // worker.config_schema.parse(payload.worker_config);

  // update thread model
  await db
    .update(threads_table)
    .set({
      worker_config: payload.worker_config,
    })
    .where(eq(threads_table.id, thread_id));
  console.log(`updated model_id for thread ${thread.id}`);

  const updated_thread = {
    ...thread,
    worker_config: payload.worker_config,
  };
  return c.json(updated_thread);
};
