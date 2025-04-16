import { db } from "@src/db";
import { messages_table } from "@src/db/schema";
import { thread_event_manager } from "@src/logic/thread_event_manager";
import type { MessageTokenGeneratedEvent } from "@src/types";
import { generate_thread_name } from "@src/utils/generate_thread_name";
import cuid from "cuid";
import { eq } from "drizzle-orm";
import type { H } from "hono/types";

export const create_message_stream: H = async c => {
  const thread_id = c.req.param("thread_id");
  const message_id = c.req.param("message_id");
  const thread_state_id = c.req.param("thread_state_id");

  console.log("create_message_stream");

  const stream = c.req.raw.body.pipeThrough(new TextDecoderStream());
  const reader = stream.getReader();

  let message_content = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    message_content += value;

    const event: MessageTokenGeneratedEvent = {
      id: cuid(),
      type: "message_token_generated",
      data: {
        thread_id,
        thread_state_id,
        message_id,
        token: value,
        version: 1,
      },
    };
    thread_event_manager.broadcast(thread_id, event);
  }

  await db
    .update(messages_table)
    .set({
      content: { text: message_content },
    })
    .where(eq(messages_table.id, message_id));

  void generate_thread_name(thread_id);

  return c.text("success");
};
