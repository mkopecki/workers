import type {
  messages_table,
  run_steps_table,
  runs_table,
  thread_states_table,
  threads_table,
} from "./db/schema";

export type Run = typeof runs_table.$inferSelect;
export type RunStep = typeof run_steps_table.$inferSelect;
export type Thread = typeof threads_table.$inferSelect;
export type Message = typeof messages_table.$inferSelect;
export type ThreadState = typeof thread_states_table.$inferSelect;

export type ThreadStateCreatedEvent = {
  id: string;
  type: "thread_state_created";
  data: { thread_state: ThreadState };
};
export type RunCreatedEvent = {
  id: string;
  type: "run_created";
  data: { run: Run };
};
export type RunCompletedEvent = {
  id: string;
  type: "run_completed";
  data: { thread_id: string };
};
export type MessageTokenGeneratedEvent = {
  id: string;
  type: "message_token_generated";
  data: {
    thread_id: string;
    thread_state_id: string;
    message_id: string;
    token: string;
    version: number;
  };
};
export type MessageCreatedEvent = {
  id: string;
  type: "message_created";
  data: {
    message: Message;
  };
};
export type MessageCompletedEvent = {
  id: string;
  type: "message_completed";
  data: {
    message_id: string;
  };
};
export type RunStepCreatedEvent = {
  id: string;
  type: "run_step_created";
  data: {
    run_step: RunStep;
  };
};

export type Event =
  | ThreadStateCreatedEvent
  | RunCreatedEvent
  | RunCompletedEvent
  | MessageTokenGeneratedEvent
  | MessageCreatedEvent
  | MessageCompletedEvent
  | RunStepCreatedEvent;

export type ThreadData = Thread & {
  thread_states: (ThreadState & {
    runs: (Run & {
      run_steps: RunStep[];
    })[];
    messages: Message[];
  })[];
};
