import { db } from "@src/db";
import { runs_table } from "@src/db/schema";
import type { H } from "hono/types";
import { eq } from "drizzle-orm";

export const get_run: H = async c => {
  const run_id = c.req.param("id");

  // pull run from databas
  const [run] = await db
    .select()
    .from(runs_table)
    .where(eq(runs_table.id, run_id));

  return c.json(run);
};
