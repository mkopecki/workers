import OpenAI from "openai";
import { server_adapter } from "../worker_utils/server_adapter";
import { server_format_transform } from "../worker_utils/openai_adapter";

const run_id = Bun.argv[2];

// generate completion
const run = await server_adapter.get_run(run_id);
const { thread_id, thread_state_id } = run.args as any;
const { model, reasoning_effort } = run.config as any;
const messages = await server_adapter.get_thread(thread_id, thread_state_id);

const openai_client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai_messages = messages.map(m => ({
  role: m.role,
  content: m.content.text,
}));

// create new message
const message = await server_adapter.create_message({
  thread_id,
  thread_state_id,
  run_id,
  author: model,
  content: "",
});

const completion_stream = await openai_client.chat.completions.create({
  model,
  messages: openai_messages,
  stream: true,
  reasoning_effort,
});

const message_stream = completion_stream
  .toReadableStream()
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(server_format_transform);

await server_adapter.create_message_stream({
  thread_id,
  thread_state_id,
  message_id: message.id,
  stream: message_stream,
});
