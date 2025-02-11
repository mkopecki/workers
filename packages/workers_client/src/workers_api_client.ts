import type { Thread, ThreadData, ThreadState } from "workers_server/src/types";
import type { CreateThreadArgs } from "workers_server/src/routes/create_thread";
import type { CreateRunArgs } from "workers_server/src/routes/create_run";
import type { CreateMessageArgs } from "workers_server/src/routes/create_message";
import { build_server_url } from "./api";
import { ThreadUpdate } from "workers_server/src/routes/update_thread";

const FETCH_SETTINGS = {
  credentials: "include",
} as const;

const FETCH_POST_SETTINGS = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};

const get_threads = async (): Promise<Thread[] | null> => {
  const res = await fetch(build_server_url("/api/thread"), FETCH_SETTINGS);
  if (res.status === 200) {
    const threads = await res.json();
    return threads;
  } else {
    return null;
  }
};

const create_thread = async (data: CreateThreadArgs): Promise<void> => {
  const url = build_server_url("/api/thread");
  await fetch(url, {
    ...FETCH_SETTINGS,
    ...FETCH_POST_SETTINGS,
    body: JSON.stringify(data),
  });
};

const create_message = async (
  thread_id: string,
  data: CreateMessageArgs
): Promise<ThreadState | null> => {
  const url = build_server_url(`/api/thread/${thread_id}/message`);
  const res = await fetch(url, {
    ...FETCH_SETTINGS,
    ...FETCH_POST_SETTINGS,
    body: JSON.stringify(data),
  });

  if (res.status === 200) {
    const thread_state = await res.json();
    return thread_state;
  } else {
    return null;
  }
};

const create_run = async (data: CreateRunArgs): Promise<ThreadState | null> => {
  const url = build_server_url("/api/run");
  const res = await fetch(url, {
    ...FETCH_SETTINGS,
    ...FETCH_POST_SETTINGS,
    body: JSON.stringify(data),
  });

  if (res.status === 200) {
    const thread_state = res.json();
    return thread_state;
  } else {
    return null;
  }
};

const get_thread_data = async (thread_id: string): Promise<ThreadData | null> => {
  const url = build_server_url(`/api/thread/${thread_id}`);
  const res = await fetch(url, FETCH_SETTINGS);

  if (res.status === 200) {
    const thread_data = await res.json();
    return thread_data;
  } else {
    return null;
  }
};

const update_thread = async (thread_id: string, data: ThreadUpdate): Promise<Thread | null> => {
  const url = build_server_url(`/api/thread/${thread_id}`);
  const res = await fetch(url, {
    ...FETCH_SETTINGS,
    ...FETCH_POST_SETTINGS,
    body: JSON.stringify(data),
  });

  if (res.status === 200) {
    const thread = await res.json();
    return thread;
  } else {
    return null;
  }
};

export const workers_api_client = {
  get_threads,
  create_thread,
  create_message,
  create_run,
  get_thread_data,
  update_thread,
};
