import type { H } from "hono/types";
import { db } from "../db/db";
import { run_steps_table } from "../db/schema";
import {eq} from "drizzle-orm";

export const get_run_steps: H = async (c) => {
  const id = c.req.param("id");
  const run_steps = await db.select().from(run_steps_table).where(eq(run_steps_table.run_id, id));
  return c.json(run_steps);
}
