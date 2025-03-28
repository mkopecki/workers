import type { Thread } from "@src/types";
import type { JWTPayload } from "./jwt";
import { db } from "@src/db/db";
import { threads_table } from "@src/db/schema";
import { eq } from "drizzle-orm";

const is_thread_owner = async (
  thread_id: string,
  user_id: string
): Promise<Thread> => {
  const [thread] = await db
    .select()
    .from(threads_table)
    .where(eq(threads_table.id, thread_id));
  if (user_id !== thread.user_id) {
    throw new Error("thread not found");
  }

  return thread;
};

export const auth = {
  is_thread_owner,
};
