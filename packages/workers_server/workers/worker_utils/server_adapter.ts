import type { Message, Run } from "@src/types";
import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:3000/worker",
});

const get_run = async (run_id: string): Promise<Run> => {
  const route = `/run/${run_id}`;
  const { data } = await client.get<Run>(route);
  return data;
};

const get_thread = async (
  thread_id: string,
  thread_state_id: string
): Promise<Message[]> => {
  const route = `/thread/${thread_id}/state/${thread_state_id}`;
  const { data } = await client.get<Message[]>(route);
  return data;
};

const create_message = async ({
  thread_id,
  thread_state_id,
  run_id,
  author,
  content,
}): Promise<any> => {
  const data = {
    run_id,
    thread_state_id,
    author,
    content,
  };

  const route = `/thread/${thread_id}/message`;
  const res = await client.post(route, data);
  return res.data;
};

const create_message_chunk = async ({
  message_id,
  run_id,
  thread_id,
  thread_state_id,
  version,
  content_chunk,
}): Promise<void> => {
  const data = {
    message_id,
    run_id,
    thread_state_id,
    content_chunk,
    version,
    author: "",
  };

  const route = `/thread/${thread_id}/message/chunk`;
  await client.post(route, data);
};

const create_message_stream = async ({
  thread_id,
  thread_state_id,
  message_id,
  stream,
}): Promise<void> => {
  const route = `http://localhost:3000/worker/thread/${thread_id}/${thread_state_id}/message/${message_id}/stream`;
  fetch(route, {
    method: "POST",
    body: stream,
  });
};

const create_run_step = async (
  run_id: string,
  description: string
): Promise<void> => {
  const data = {
    description,
  };
  const route = `/run/${run_id}/step`;
  await client.post(route, data);
};

export const server_adapter = {
  get_run,
  get_thread,
  create_message,
  create_message_chunk,
  create_run_step,
  create_message_stream,
};
