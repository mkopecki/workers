import { create_openai_chat_model } from "./openai_chat_model";
import type { Message } from "@src/types";

export type ChatModel = {
  name: string;
  create_completion: (messages: Message[]) => Promise<string>;
};

export const models = {
  "openai_gpt_4o": create_openai_chat_model("gpt-4o"),
  "openai_gpt_4o_mini": create_openai_chat_model("gpt-4o-mini"),
};

export type AvailableModels = keyof typeof models;

export const get_model = (model_name: string) => {
  if (!(model_name in models)) {
    throw new Error("model is not available");
  }

  return models[model_name as AvailableModels];
};
