import type { Run } from "@src/types";
import { get_message_history } from "@src/utils/get_message_history";
import OpenAI from "openai";

type ReasoningWorkerConfig = {};

const run = async (config: ReasoningWorkerConfig, run: Run) => {
  const messages = await get_message_history(
    run.thread_id,
    run.thread_state_id
  );

  const openai_messages = messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  const client = new OpenAI();

  const completion = await client.chat.completions.create({
    model: "o3-mini",
    reasoning_effort: "medium",
    messages: openai_messages,
  });

  const content = completion.choices[0].message.content;
};

export const reasoning_worker_v1: Worker<ReasoningWorkerConfig> = {
  id: "reasoning_worker_v1",
  run,
};
