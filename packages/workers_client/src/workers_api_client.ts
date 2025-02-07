import type {
  Message,
  Run,
  RunStep,
  Thread,
  ThreadData,
  ThreadMessage,
  ThreadState,
} from "workers_server/src/types";
import type { CreateThreadArgs } from "workers_server/src/routes/create_thread";
import type { CreateRunArgs } from "workers_server/src/routes/create_run";
import type { CreateMessageArgs } from "workers_server/src/routes/create_message";

const HOST = "http://localhost:3000/api";
const build_url = (endpoint: string) => `${HOST}${endpoint}`;

const get_threads = async (): Promise<Thread[]> => {
  const res = await fetch(build_url("/thread"));
  const threads = await res.json();
  return threads;
};

const create_thread = async (data: CreateThreadArgs): Promise<void> => {
 await fetch(`${HOST}/thread`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

const get_messages = async (thread_id: string): Promise<ThreadMessage[]> => {
  const res = await fetch(build_url(`/thread/${thread_id}/message`));
  const messages = await res.json();
  return messages;
};

const get_thread_runs = async (thread_id: string): Promise<Run[]> => {
  const res = await fetch(build_url(`/thread/${thread_id}/run`));
  const runs = await res.json();
  return runs;
};

const get_run = async (run_id: string): Promise<Run> => {
  const res = await fetch(build_url(`/run/${run_id}`));
  const run = await res.json();
  return run;
};

const get_run_steps = async (run_id: string): Promise<RunStep[]> => {
  const res = await fetch(build_url(`/run/${run_id}/steps`));
  const run_steps = await res.json();
  return run_steps;
};

const create_message = async (thread_id: string, data: CreateMessageArgs): Promise<ThreadState> => {
  const res = await fetch(`${HOST}/thread/${thread_id}/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const thread_state = await res.json();
  return thread_state;
};

const create_run = async (data: CreateRunArgs): Promise<ThreadState> => {
  const res = await fetch(`${HOST}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const thread_state = res.json();
  return thread_state;
};

const get_thread = async (thread_id: string): Promise<Thread> => {
  const res = await fetch(`${HOST}/thread/${thread_id}`);
  const thread = await res.json();
  return thread;
};

const get_thread_data = async (thread_id: string): Promise<ThreadData> => {
  const res = await fetch(`${HOST}/thread/${thread_id}`);
  const thread_data = await res.json();
  return thread_data;
};

export const workers_api_client = {
  get_threads,
  get_thread,
  create_thread,
  get_messages,
  create_message,
  get_thread_runs,
  create_run,

  get_run,
  get_run_steps,
  get_thread_data,
};
