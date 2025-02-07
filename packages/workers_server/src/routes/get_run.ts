import type { H } from "hono/types";
import { db } from "../db/db";
import { runs_table } from "../db/schema";
import { eq } from "drizzle-orm";

export const get_run: H = async (c) => {
  const id = c.req.param("id");
  const [run] = await db.select().from(runs_table).where(eq(runs_table.id, id));
  return c.json(run);
};
