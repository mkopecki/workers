import { db } from "@src/db/db";
import { threads_table } from "@src/db/schema";
import type { H } from "hono/types";
import { z } from "zod";
import { eq } from "drizzle-orm";

const thread_update = z.object({
  model_id: z.string(),
});

export type ThreadUpdate = z.infer<typeof thread_update>;

export const update_thread: H = async c => {
  const thread_id = c.req.param("id");
  const payload = await c.req.json<ThreadUpdate>();
  thread_update.parse(payload);

  // check thread permissions
  const [thread] = await db
    .select()
    .from(threads_table)
    .where(eq(threads_table.id, thread_id));
  const user_id = c.get("jwtPayload")["id"];
  if (user_id !== thread.user_id) {
    return c.json({ message: "Not found." }, 404);
  }

  // update thread model
  await db
    .update(threads_table)
    .set({
      worker_config: {
        model_id: payload.model_id,
      },
    })
    .where(eq(threads_table.id, thread_id));
  console.log(`updated model_id for thread ${thread.id}`);

  const updated_thread = {
    ...thread,
    worker_config: {
      model_id: payload.model_id,
    },
  };
  return c.json(updated_thread);
};
