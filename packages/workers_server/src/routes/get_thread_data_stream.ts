import { streamSSE } from "hono/streaming";
import type { H } from "hono/types";
import { thread_manager } from "@src/thread_manager";

export const get_thread_data_stream: H = async c => {
  const thread_id = c.req.param("id");

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
