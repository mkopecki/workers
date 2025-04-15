import { db } from "@src/db/db";
import { files_table } from "@src/db/schema";
import type { H } from "hono/types";
import { eq } from "drizzle-orm";

export const get_thread_files: H = async c => {
  const thread_id = c.req.param("id");

  const files = await db
    .select({ id: files_table.id, name: files_table.name })
    .from(files_table)
    .where(eq(files_table.thread_id, thread_id));

  return c.json(files);
};
