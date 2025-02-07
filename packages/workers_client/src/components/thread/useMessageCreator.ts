import { workers_api_client } from "@/workers_api_client";
import { useQueryClient } from "@tanstack/react-query";
import { Message } from "workers_server/src/types";

export const useMessageCreator = () => {
  const query_client = useQueryClient();

  const create_message = async (thread_id: string, message_id: string, message_content: string) => {
    const query_key = ["thread", thread_id, "messages"];

    await query_client.cancelQueries({ queryKey: query_key });

    const optimistic_message: Message = {
      id: "optimistic_message",
      created_at: new Date().toISOString(),
      role: "user",
      content: message_content,
      thread_id,
      previous_message_id: message_id,
    };
    query_client.setQueryData(query_key, (previous_messages: Message[]) => [
      ...previous_messages,
      optimistic_message,
    ]);

    const user_message = await workers_api_client.create_message(thread_id, {
      content: message_content,
      previous_message_id: message_id,
    });
    await workers_api_client.create_run({ thread_id, message_id: user_message.id });

    query_client.invalidateQueries({ queryKey: ["thread", thread_id, "messages"] });
  };

  return {
    create_message,
  };
};
