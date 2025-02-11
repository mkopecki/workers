import { streamSSE } from "hono/streaming";
import type { H } from "hono/types";
import { thread_manager } from "@src/thread_manager";
import { db } from "@src/db/db";
import { threads_table } from "@src/db/schema";
import { eq } from "drizzle-orm";

export const get_thread_data_stream: H = async c => {
  const thread_id = c.req.param("id");

  // permission check
  const [thread] = await db
    .select()
    .from(threads_table)
    .where(eq(threads_table.id, thread_id));
  const user_id = c.get("jwtPayload")["id"];
  if (user_id !== thread.user_id) {
    return c.json({ message: "Not found." }, 404);
  }

  return streamSSE(
    c,
    async stream => {
      // flush out http headers
      await stream.writeln("headers flush");

      const { id, sse_stream } = thread_manager.get_sse_stream(thread_id);
      stream.onAbort(() => {
        console.log("aborted stream");
        thread_manager.delete_sse_stream(thread_id, id);
      });

      await stream.pipe(sse_stream);
    },
    async (err, stream) => {
      stream.writeln("An error occurred!");
      console.error(err);
    }
  );
};
