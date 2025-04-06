import { db } from "@src/db/db";
import { threads_table } from "@src/db/schema";
import type { H } from "hono/types";
import { eq } from "drizzle-orm";

export const archive_thread: H = async c => {
  const thread_id = c.req.param("id");

  // access control
  const [thread] = await db
    .select()
    .from(threads_table)
    .where(eq(threads_table.id, thread_id));
  const user_id = c.get("jwtPayload")["id"];
  if (user_id !== thread.user_id) {
    return c.json({ message: "Not found." }, 404);
  }

  // update to archived
  await db
    .update(threads_table)
    .set({ status: "archived" })
    .where(eq(threads_table.id, thread_id));

  return c.text("success");
};
