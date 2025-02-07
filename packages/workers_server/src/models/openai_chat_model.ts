import OpenAI from "openai";
import type { ChatModel } from "@src/models/models";
import type { Message } from "@src/types";

export const openai_client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const create_openai_chat_model = (model_name: string): ChatModel => ({
  name: "openai_gtp_4o",
  create_completion: async (messages: Message[]) => {
    const openai_messages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const chat_completion = await openai_client.chat.completions.create({
      model: model_name,
      messages: openai_messages,
    });

    const output = chat_completion.choices[0].message.content;

    if (output === null) {
      throw new Error("OpenAI model inference failed");
    }

    return output;
  },
});
