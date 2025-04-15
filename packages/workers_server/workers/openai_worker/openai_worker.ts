import { server_adapter } from "./server_adapter";
import OpenAI from "openai";

const run_id = Bun.argv[2];

// generate completion
const run = await server_adapter.get_run(run_id);
const { thread_id, thread_state_id } = run.args as any;
const { model } = run.config as any;
const messages = await server_adapter.get_thread(thread_id, thread_state_id);

const openai_client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai_messages = messages.map(m => ({
  role: m.role,
  content: m.content.text,
}));

const completion = await openai_client.chat.completions.create({
  model,
  messages: openai_messages,
});

const content = completion.choices[0].message.content;

await server_adapter.create_message({
  thread_id,
  thread_state_id,
  run_id,
  author: model,
  content,
});
