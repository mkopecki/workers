import OpenAI from "openai";
import type { Message } from "@src/types";

export type ChatModel = {
  name: string;
  create_completion: (messages: Message[]) => Promise<string>;
};

export const models = ["openai_gpt_4o", "openai_gpt_4o_mini"] as const;
export type AvailableModels = (typeof models)[number];

type Client = {
  client: OpenAI;
  client_model: string;
};

export const create_openai_client = (model: AvailableModels): Client => {
  const openai_client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  switch (model) {
    case "openai_gpt_4o": {
      return {
        client: openai_client,
        client_model: "gpt-4o",
      };
    }

    case "openai_gpt_4o_mini": {
      return {
        client: openai_client,
        client_model: "gpt-4o-mini",
      };
    }
  }
};
