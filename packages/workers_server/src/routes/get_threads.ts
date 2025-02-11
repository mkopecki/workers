import type { H } from "hono/types";
import { db } from "../db/db";
import { threads_table } from "../db/schema";
import { eq } from "drizzle-orm";

export const get_threads: H = async c => {
  const user_id = c.get("jwtPayload")["id"];

  console.log(`retrieving threads from database`);
  const threads = await db
    .select()
    .from(threads_table)
    .where(eq(threads_table.user_id, user_id));
  return c.json(threads);
};
