import Antrophic from "@anthropic-ai/sdk";
import { server_adapter } from "../worker_utils/server_adapter";

const run_id = Bun.argv[2];

// generate completion
const run = await server_adapter.get_run(run_id);
const { thread_id, thread_state_id } = run.args as any;
const { model } = run.config as any;
const messages = await server_adapter.get_thread(thread_id, thread_state_id);

const anthropic_client = new Antrophic();

const anthropic_messages = messages.map(m => ({
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

const completion_stream = await anthropic_client.messages.create({
  model,
  max_tokens: 1024,
  messages: anthropic_messages,
  stream: true,
});

export const server_format_transform = new TransformStream({
  transform: (chunk, controller) => {
    const sse = JSON.parse(chunk);

    if (sse.type === "content_block_delta") {
      const delta = sse.delta?.text;
      if (delta) {
        controller.enqueue(delta);
      }
    }
  },
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
