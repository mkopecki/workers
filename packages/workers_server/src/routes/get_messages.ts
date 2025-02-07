import type { H } from "hono/types";
import { db } from "../db/db";
import { messages_table, run_steps_table, runs_table } from "../db/schema";
import { eq, asc } from "drizzle-orm";
import type { ThreadMessage } from "@src/types";

export const get_messages: H = async (c) => {
  const thread_id = c.req.param("id");

  const messages = await db
    .select()
    .from(messages_table)
    .where(eq(messages_table.thread_id, thread_id))
    .orderBy(asc(messages_table.created_at));

  const thread_messages: ThreadMessage[] = await Promise.all(
    messages.map(async (m) => {
      if (m.run_id) {
        const [run] = await db.select().from(runs_table).where(eq(runs_table.id, m.run_id));

        const run_steps = await db
          .select()
          .from(run_steps_table)
          .where(eq(run_steps_table.run_id, run.id));

        return {
          message: m,
          run,
          run_steps,
        };
      } else {
        return {
          message: m,
        };
      }
    })
  );

  return c.json(thread_messages);
};
