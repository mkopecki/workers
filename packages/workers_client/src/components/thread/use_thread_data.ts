import { workers_api_client } from "@/workers_api_client";
import { useEffect } from "react";
import {
  Message,
  ThreadData,
  MessageCreatedEvent,
  RunStep,
  Run,
  ThreadState,
  ThreadStateCreatedEvent,
  MessageTokenGeneratedEvent,
  MessageCompletedEvent,
} from "workers_server/src/types";
import { create } from "zustand";

type ThreadDataStore = {
  thread_data: ThreadData | null;

  thread_state: ThreadState | null;
  thread_state_history: ThreadState[];

  load_thread_data: (thread_data: ThreadData) => void;
  load_thread_state: (thread_state_id: string) => void;

  consume_thread_state_created_event: (event_data: ThreadStateCreatedEvent["data"]) => void;
  consume_message_created_event: (event_data: MessageCreatedEvent["data"]) => void;
  consume_message_token_generated_event: (event_data: MessageTokenGeneratedEvent["data"]) => void;
};

export const use_thread_data_store = create<ThreadDataStore>((set, get) => ({
  thread_data: null,
  thread_state: null,

  thread_state_history: [],

  load_thread_data: (thread_data: ThreadData) => {
    console.log(`thread_data_store: loading new thread data`);
    set(() => ({ thread_data }));
  },

  load_thread_state: (thread_state_id: string) => {
    console.log(`thread_data_store: attempting to load thread_state with id ${thread_state_id}`);
    const thread_data = get().thread_data;
    if (!thread_data) {
      console.error("thread_data_store: can't load thread_state. thread_data has not been loaded yet.");
      return;
    }

    const thread_state = thread_data.thread_states.find((s) => s.id === thread_state_id);
    if (!thread_state) {
      console.error("thread_data_store: can't load thread_state. thread_id with given id could not be found.");
      return;
    }

    // build thread history
    const thread_state_history: ThreadState[] = [];

    let current_thread_state: ThreadState | null = thread_state;

    while (current_thread_state) {
      thread_state_history.push(current_thread_state);

      if (current_thread_state.previous_thread_state_id) {
        const previous_thread_state = thread_data.thread_states.find(
          (s) => s.id === current_thread_state.previous_thread_state_id
        );

        current_thread_state = previous_thread_state ?? null;
      } else {
        current_thread_state = null;
      }
    }

    thread_state_history.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    console.log(`thread_data_store: built thread_state_history for thread_state ${thread_state_id}`);

    set((state) => ({
      thread_data: state.thread_data,
      thread_state,
      thread_state_history,
    }));
    console.log(`thread_data_store: successfully loaded thread_state ${thread_state_id}`);
    console.log({thread_state_history: get().thread_state_history});
  },

  consume_thread_state_created_event: (event_data: ThreadStateCreatedEvent["data"]) => {
    const { thread_state } = event_data;
    console.log(`thread_data_store: consuming thread_state_created_event for thread_state ${thread_state.id}`);

    set((state) => ({
      ...state,
      thread_data: {
        ...state.thread_data,
        thread_states: [
          ...state.thread_data.thread_states,
          {
            ...thread_state,
            runs: [],
            messages: [],
          },
        ],
      },
    }));
    console.log(`thread_data_store: added new thread_state ${thread_state.id} to thread_data`);
    console.log(get().thread_data);

    get().load_thread_state(thread_state.id);
  },

  consume_message_created_event: (event_data: MessageCreatedEvent["data"]) => {
    const { message } = event_data;
    console.log(`thread_data_store: consuming message_created_event for message ${message.id}`);

    set((state) => ({
      ...state,
      thread_data: {
        ...state.thread_data,
        thread_states: state.thread_data.thread_states.map((ts) => {
          if (message.thread_state_id === ts.id) {
            return {
              ...ts,
              messages: [...ts.messages, message],
            };
          } else {
            return ts;
          }
        }),
      },
    }));
    console.log(`thread_data_store: added new message ${message.id} to thread_data`);
    console.log(get().thread_data);

    get().load_thread_state(message.thread_state_id);
  },

  consume_message_token_generated_event: (event_data: MessageTokenGeneratedEvent["data"]) => {
    const { message_id, token, version, thread_state_id } = event_data;
    console.log(`thread_data_store: consuming message_token_generated_event for message ${message_id}`);

    set((state) => ({
      ...state,
      thread_data: {
        ...state.thread_data,
        thread_states: state.thread_data?.thread_states.map((ts) => {
          if (thread_state_id === ts.id) {
            return {
              ...ts,
              messages: ts.messages.map((m) => {
                if (message_id === m.id) {
                  if (m.version < version) {
                    return {
                      ...m,
                      content: m.content + token,
                      version,
                    };
                  } else {
                    return m;
                  }
                } else {
                  return m;
                }
              }),
            };
          } else {
            return ts;
          }
        }),
      },
    }));
    console.log(`thread_data_store: added new message token for message ${message_id} to thread_data`);
    get().load_thread_state(thread_state_id);
    console.log({thread_data: get().thread_data});
    console.log({thread_state_history: get().thread_state_history});
  },
}));

export const use_thread_data = (thread_id: string) => {
  const thread_data_store = use_thread_data_store();

  const load_data = async (reset_state: boolean) => {
    const new_thread_data = await workers_api_client.get_thread_data(thread_id);
    console.log(new_thread_data);
    thread_data_store.load_thread_data(new_thread_data);

    if (reset_state) {
      const newest_state = new_thread_data.thread_states.at(-1);
      if (newest_state) {
        thread_data_store.load_thread_state(newest_state.id);
      }
    }
  };

  useEffect(() => {
    console.log("creating event source");
    const event_source = new EventSource(`http://localhost:3000/api/thread/${thread_id}/stream`);

    event_source.addEventListener("thread_state_created", (event) => {
      const event_data = JSON.parse(event.data) as ThreadStateCreatedEvent["data"];
      console.log({ event_data });
      thread_data_store.consume_thread_state_created_event(event_data);
    });
    event_source.addEventListener("run_created", (event) => {
      console.log({ event });
    });
    event_source.addEventListener("message_created", (event) => {
      const event_data = JSON.parse(event.data) as MessageCreatedEvent["data"];
      thread_data_store.consume_message_created_event(event_data);
      console.log({ event_data });
    });
    event_source.addEventListener("message_token_generated", (event) => {
      const event_data = JSON.parse(event.data) as MessageTokenGeneratedEvent["data"];
      console.log({ event_data });
      thread_data_store.consume_message_token_generated_event(event_data);
    });
    event_source.addEventListener("message_completed", (event) => {
      console.log({ event });
    });
    event_source.addEventListener("run_step_created", (event) => {
      console.log({ event });
    });

    return () => {
      event_source.close();
    };
  }, [thread_id]);

  const create_message = async (content: string) => {
    const current_thread_state_id = thread_data_store.thread_state?.id;
    if (!current_thread_state_id) {
      console.error("cannot create message while no state is selected");
      return;
    }

    // reload data
    const message_thread_state = await workers_api_client.create_message(thread_id, {
      content,
      current_thread_state_id,
    });

    const run_thread_state = await workers_api_client.create_run({
      thread_id,
      current_thread_state_id: message_thread_state.id,
    });

    // await load_data(false);
    // thread_data_store.load_thread_state(run_thread_state.id);
  };

  return { thread_data_store, create_message };
};
