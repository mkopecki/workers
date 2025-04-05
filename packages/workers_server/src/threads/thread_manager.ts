import cuid from "cuid";
import { db } from "../db/db";
import {
  messages_table,
  run_steps_table,
  runs_table,
  thread_states_table,
  threads_table,
} from "../db/schema";
import type {
  Event,
  Message,
  MessageCompletedEvent,
  MessageCreatedEvent,
  MessageTokenGeneratedEvent,
  Run,
  RunCreatedEvent,
  RunStep,
  RunStepCreatedEvent,
  ThreadState,
  ThreadStateCreatedEvent,
} from "../types";
import { eq } from "drizzle-orm";

type EventListener = (event: Event) => void;
const sse_listeners: Record<string, Record<string, EventListener>> = {};

const broadcast_event = (thread_id: string, event: Event) => {
  console.log(`broadcasting event ${event.id}`);
  if (thread_id in sse_listeners) {
    for (const sse_listener of Object.values(sse_listeners[thread_id])) {
      sse_listener(event);
    }
  }
};

export const thread_manager = {
  create_thread_state: async (
    thread_state: typeof thread_states_table.$inferInsert
  ) => {
    // broadcast event
    const event: ThreadStateCreatedEvent = {
      id: cuid(),
      type: "thread_state_created",
      data: { thread_state: thread_state as ThreadState },
    };
    broadcast_event(thread_state.thread_id, event);

    // insert into database
    await db.insert(thread_states_table).values(thread_state);
    console.log(`created thread_state ${thread_state.id}`);
  },

  create_run: async (run: typeof runs_table.$inferInsert) => {
    // broadcast event
    const event: RunCreatedEvent = {
      id: cuid(),
      type: "run_created",
      data: { run: run as Run },
    };
    broadcast_event(run.thread_id, event);

    // insert into database
    await db.insert(runs_table).values(run);
    console.log(`created run ${run.id}`);
  },

  create_run_step: async (
    thread_id: string,
    run_step: typeof run_steps_table.$inferInsert
  ) => {
    const event: RunStepCreatedEvent = {
      id: cuid(),
      type: "run_step_created",
      data: {
        run_step: run_step as RunStep,
      },
    };
    broadcast_event(thread_id, event);

    await db.insert(run_steps_table).values(run_step);
    console.log(`created run_step ${run_step.id}`);
  },

  create_message: async (message: typeof messages_table.$inferInsert) => {
    const event: MessageCreatedEvent = {
      id: cuid(),
      type: "message_created",
      data: {
        message: message as Message,
      },
    };
    broadcast_event(message.thread_id, event);

    await db.insert(messages_table).values(message);
    await db
      .update(threads_table)
      .set({ updated_at: new Date() })
      .where(eq(threads_table.id, message.thread_id));
  },

  append_generating_message_token: async (
    thread_id: string,
    thread_state_id: string,
    message_id: string,
    token: string,
    version: number
  ) => {
    // broadcast event
    const event: MessageTokenGeneratedEvent = {
      id: cuid(),
      type: "message_token_generated",
      data: {
        thread_id,
        thread_state_id,
        message_id,
        token,
        version,
      },
    };
    broadcast_event(thread_id, event);
  },

  complete_generating_message: async (
    thread_id: string,
    message_id: string,
    content: string
  ) => {
    // broadcast event
    const event: MessageCompletedEvent = {
      id: cuid(),
      type: "message_completed",
      data: {
        message_id,
      },
    };
    broadcast_event(thread_id, event);

    // update database
    await db
      .update(messages_table)
      .set({
        status: "done",
        version: -1,
        content,
      })
      .where(eq(messages_table.id, message_id));
    console.log(`marked message ${message_id} as completed`);
  },

  get_sse_stream: (
    thread_id: string
  ): { id: string; sse_stream: ReadableStream } => {
    const id = cuid();
    let listener: EventListener;

    const sse_stream = new ReadableStream({
      start(controller) {
        listener = (event: Event) => {
          controller.enqueue(`event: ${event.type}\n`);
          controller.enqueue(`data: ${JSON.stringify(event.data)}\n\n`);
        };

        if (!(thread_id in sse_listeners)) {
          sse_listeners[thread_id] = {};
        }

        sse_listeners[thread_id][id] = listener;
      },
      cancel() {
        delete sse_listeners[thread_id][id];
      },
    });

    return {
      id,
      sse_stream,
    };
  },

  delete_sse_stream: (thread_id: string, event_listener_id: string) => {
    delete sse_listeners[thread_id][event_listener_id];
  },
};
