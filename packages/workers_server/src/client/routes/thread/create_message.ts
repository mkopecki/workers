import {
  messages_table,
  thread_states_table,
  threads_table,
} from "@src/db/schema";
import cuid from "cuid";
import type { H } from "hono/types";
import { auth } from "@src/auth/auth";
import { thread_event_manager } from "@src/logic/thread_event_manager";
import { db } from "@src/db";
import type {
  Message,
  MessageCreatedEvent,
  ThreadStateCreatedEvent,
} from "@src/types";
import { eq } from "drizzle-orm";

export type CreateMessagePayload = {
  current_thread_state_id: string;
  content: string;
};

export const create_message: H = async c => {
  const thread_id = c.req.param("id");
  const data = await c.req.json<CreateMessagePayload>();

  const jwt_payload = c.get("jwtPayload");
  const user_id = jwt_payload.id;

  // create new thread state
  const thread_state: typeof thread_states_table.$inferInsert = {
    id: cuid(),
    created_at: new Date(),
    thread_id,
    previous_thread_state_id: data.current_thread_state_id,
  };

  const thread_state_created_event: ThreadStateCreatedEvent = {
    id: cuid(),
    type: "thread_state_created",
    data: { thread_state: thread_state },
  };
  thread_event_manager.broadcast(
    thread_state.thread_id,
    thread_state_created_event
  );

  await db.insert(thread_states_table).values(thread_state);
  console.log(`created thread_state ${thread_state.id}`);

  const message: typeof messages_table.$inferInsert = {
    id: cuid(),
    role: "user",
    created_at: new Date(),

    thread_state_id: thread_state.id,

    author: user_id,
    content: { text: data.content },
    thread_id: thread_id,
  };

  const message_created_event: MessageCreatedEvent = {
    id: cuid(),
    type: "message_created",
    data: {
      message: message as Message,
    },
  };
  thread_event_manager.broadcast(message.thread_id, message_created_event);

  await db.insert(messages_table).values(message);
  await db
    .update(threads_table)
    .set({ updated_at: new Date() })
    .where(eq(threads_table.id, message.thread_id));
  console.log(`created message for thread ${thread_id}`);

  return c.json(thread_state);
};
