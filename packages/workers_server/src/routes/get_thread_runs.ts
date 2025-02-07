import type { H } from "hono/types";
import { db } from "../db/db";
import { runs_table } from "../db/schema";
import { eq } from "drizzle-orm";

export const get_thread_runs: H = async (c) => {
  const thread_id = c.req.param("id");
  const runs = await db.select().from(runs_table).where(eq(runs_table.thread_id, thread_id));
  return c.json(runs);
};
