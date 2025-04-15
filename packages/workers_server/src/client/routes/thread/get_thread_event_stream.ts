import { streamSSE } from "hono/streaming";
import type { H } from "hono/types";
import { db } from "@src/db";
import { threads_table } from "@src/db/schema";
import { eq } from "drizzle-orm";
import { thread_event_manager } from "@src/logic/thread_event_manager";

export const get_thread_event_stream: H = async c => {
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

  c.header("Transfer-Encoding", "identity");
  return streamSSE(
    c,
    async stream => {
      // flush out http headers
      await stream.writeln("headers flush");

      const sse_stream = thread_event_manager.sse.make_sse_stream(thread_id);

      stream.onAbort(() => {
        thread_event_manager.sse.delete_sse_stream(thread_id, sse_stream.subscription_id);
      });

      await stream.pipe(sse_stream.stream);
    },
    async (err, stream) => {
      stream.writeln("An error occurred!");
      // console.error(err);
    }
  );
};
