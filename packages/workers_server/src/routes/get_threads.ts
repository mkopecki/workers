import type { H } from "hono/types";
import { db } from "../db/db";
import { threads_table } from "../db/schema";

export const get_threads: H = async (c) => {
  console.log(`retrieving threads from database`);
  const threads = await db.select().from(threads_table);
  return c.json(threads);
};
