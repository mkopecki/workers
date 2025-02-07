import type { H } from "hono/types";
import { db } from "../db/db";
import { threads_table } from "../db/schema";
import { eq } from "drizzle-orm";

export const get_thread: H = async (c) => {
  const id = c.req.param("id");
  const [thread] = await db.select().from(threads_table).where(eq(threads_table.id, id));
  return c.json(thread);
};
