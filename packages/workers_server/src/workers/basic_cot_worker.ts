import type { Worker } from "@src/workers";
import type { ChatWorkerConfig } from "./basic_chat_worker";
import type { Run } from "@src/types";
import { get_message_history } from "@src/utils/get_message_history";
import { get_model } from "@src/models/models";

export const simple_cot_chat_worker: Worker<ChatWorkerConfig> = {
  id: "simple_cot_chat_worker",
  run: async (config: ChatWorkerConfig, run: Run) => {
    // pull messages from thread
    const messages = await get_message_history(run.thread_id, run.message_id);

    // perform model inference
    const model = get_model(config.model_id);
    const completion = await model.create_completion(messages);

    const message: typeof messages_table.$inferInsert = {
      id: cuid(),
      created_at: new Date().toISOString(),
      thread_id: run.thread_id,
      previous_message_id: run.message_id,
      role: "assistant",
      content: completion,
    };
    await db.insert(messages_table).values(message);

    const run_step: typeof run_steps_table.$inferInsert = {
      id: cuid(),
      created_at: new Date().toISOString(),
      run_id: run.id,
      description: "generated message using model",
    };
    await db.insert(run_steps_table).values(run_step);
  },
};
