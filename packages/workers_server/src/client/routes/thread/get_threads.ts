import type { H } from "hono/types";
import { db } from "@src/db";
import { threads_table } from "@src/db/schema";
import { eq, and } from "drizzle-orm";

export const get_threads: H = async c => {
  const user_id = c.get("jwtPayload")["id"];

  const status = c.req.query("status");

  if (!(status === "active" || status === "archived")) {
    c.status(400);
    return c.text("Invalid request query");
  }

  console.log(`retrieving threads from database`);
  const threads = await db
    .select()
    .from(threads_table)
    .where(
      and(eq(threads_table.user_id, user_id), eq(threads_table.status, status))
    );
  return c.json(threads);
};
