import { messages_table, thread_states_table } from "../db/schema";
import cuid from "cuid";
import type { H } from "hono/types";
import { auth } from "@src/auth/auth";
import { thread_manager } from "./thread_manager";

export type CreateMessagePayload = {
  current_thread_state_id: string;
  content: string;
};

export const create_message: H = async c => {
  const thread_id = c.req.param("id");
  const data = await c.req.json<CreateMessagePayload>();

  const jwt_payload = c.get("jwtPayload");
  const user_id = jwt_payload.id;

  // permission check
  auth.is_thread_owner(thread_id, jwt_payload);

  // create new thread state
  const thread_state: typeof thread_states_table.$inferInsert = {
    id: cuid(),
    created_at: new Date(),
    thread_id,
    previous_thread_state_id: data.current_thread_state_id,
  };

  await thread_manager.create_thread_state(thread_state);
  console.log(`created thread_state ${thread_state.id}`);

  const user_message: typeof messages_table.$inferInsert = {
    id: cuid(),
    role: "user",
    created_at: new Date(),

    thread_state_id: thread_state.id,

    author: user_id,
    content: data.content,
    thread_id: thread_id,
    status: "done",
  };

  await thread_manager.create_message(user_message);
  console.log(`created message for thread ${thread_id}`);

  return c.json(thread_state);
};
