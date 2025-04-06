import type { Run } from "@src/types";
import { z } from "zod";
import { generate_thread_name, get_message_history } from "../thread_utils";
import { openai_utils } from "./openai_utils";
import type { run_steps_table } from "@src/db/schema";
import cuid from "cuid";
import { thread_manager } from "@src/threads/thread_manager";

const config_schema = z.object({
  model: z.union([z.literal("gpt-4o"), z.literal("gpt-4o-mini")]),
});

const run = async (
  config: typeof config_schema._type,
  run: Run
): Promise<void> => {
  // load message history
  const { thread_id, thread_state_id } = run;
  const messages = await get_message_history({
    thread_id,
    thread_state_id,
  });

  // generate thread name
  void generate_thread_name(thread_id, messages);

  // create completion
  await openai_utils.create_stream_completion({
    thread_id,
    thread_state_id,
    model: config.model,
    messages,
  });

  // create run step
  const run_step: typeof run_steps_table.$inferInsert = {
    id: cuid(),
    created_at: new Date(),
    run_id: run.id,
    description: "generated message using model",
  };
  await thread_manager.create_run_step(run.thread_id, run_step);
};

export const openai_worker = {
  id: "openai_worker",
  config_schema,
  run,
};
