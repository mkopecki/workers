import cuid from "cuid";
import type { Worker } from ".";
import { messages_table, run_steps_table } from "../db/schema";
import type { Run } from "@src/types";
import { get_message_history } from "@src/utils/get_message_history";
import { create_openai_client, type AvailableModels } from "@src/models/models";
import { thread_manager } from "@src/threads/thread_manager";

export type ChatWorkerConfig = {
  model_id: AvailableModels;
  stream?: boolean;
};

export const basic_chat_worker: Worker<ChatWorkerConfig> = {
  id: "basic_chat_worker",
  run: async (config: ChatWorkerConfig, run: Run) => {
    // pull messages from thread
    const messages = await get_message_history(
      run.thread_id,
      run.thread_state_id
    );

    // perform model inference

    const openai_messages = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    const { client, client_model } = create_openai_client(config.model_id);

    if (config?.stream ?? true) {
      const message: typeof messages_table.$inferInsert = {
        id: cuid(),
        created_at: new Date(),
        thread_id: run.thread_id,
        thread_state_id: run.thread_state_id,
        author: config.model_id as string,
        role: "assistant",
        status: "generating",
        version: 0,
        content: "",
      };
      await thread_manager.create_message(message);

      const completion_stream = await client.chat.completions.create({
        model: client_model,
        messages: openai_messages,
        stream: true,
      });

      let completion = "";
      let i = 1;
      for await (const chunk of completion_stream) {
        if (chunk.choices[0]?.delta?.content) {
          const delta = chunk.choices[0].delta.content;
          completion += delta;
          void thread_manager.append_generating_message_token(
            run.thread_id,
            run.thread_state_id,
            message.id,
            delta,
            i
          );
          i++;
        }
      }

      await thread_manager.complete_generating_message(
        run.thread_id,
        message.id,
        completion
      );
    } else {
      const completion = await client.chat.completions.create({
        model: client_model,
        messages: openai_messages,
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("output could not be generated");
      }

      const message: typeof messages_table.$inferInsert = {
        id: cuid(),
        created_at: new Date(),
        thread_id: run.thread_id,
        thread_state_id: run.thread_state_id,
        author: config.model_id as string,
        role: "assistant",
        content,
        version: -1,
        status: "done",
      };
      await thread_manager.create_message(message);
    }

    const run_step: typeof run_steps_table.$inferInsert = {
      id: cuid(),
      created_at: new Date(),
      run_id: run.id,
      description: "generated message using model",
    };
    await thread_manager.create_run_step(run.thread_id, run_step);
  },
};
