import { workers_api_client } from "@/workers_api_client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { ThreadMessage } from "./ThreadMessage";
import { Separator } from "../ui/separator";
import { ThreadMessageEditor } from "./ThreadMessageEditor";
import { useMessageCreator } from "./useMessageCreator";
import { useEffect, useRef } from "react";
import { use_thread_data } from "./use_thread_data";
import { ExtendedRun, ThreadState } from "workers_server/src/types";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Form } from "../ui/form";

type MessageEditorInputs = {
  message_content: string;
};

export const ThreadChat = () => {
  const { id } = useParams();

  const { thread_data_store, create_message } = use_thread_data(id);

  // message form
  const form = useForm<MessageEditorInputs>();

  const handle_key_press = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(handle_submit)();
    }
  };

  const query_client = useQueryClient();
  const handle_submit = async (data: any) => {
    form.reset({ message_content: "" });
    await create_message(data.message_content);

    // invalidate
    query_client.invalidateQueries({ queryKey: ["threads"] });
  };

  const reset_message_form = (prev_id: string, content: string) => {
    form.reset({ message_content: content });
    console.log(prev_id);
    thread_data_store.load_thread_state(prev_id);
    toast(`Loaded thread state ${prev_id}`);
  };

  // ensure we auto scroll to the bottom
  const message_container_ref = useRef(null);
  useEffect(() => {
    if (message_container_ref.current) {
      message_container_ref.current.scrollTop =
        message_container_ref.current.scrollHeight;
    }
  }, [thread_data_store.thread_state_history]);

  const on_thread_state_select = (thread_state_id: string) => {
    thread_data_store.load_thread_state(thread_state_id);
  };

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <div
        className="flex flex-1 flex-col p-4 gap-4 overflow-y-auto"
        ref={message_container_ref}
      >
        {thread_data_store.thread_state_history.flatMap((s) =>
          s.messages.map((m) => (
            <ThreadMessage
              key={m.id}
              message={m}
              reset_message_form={(content) =>
                reset_message_form(s.previous_thread_state_id, content)
              }
            />
          )),
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handle_submit)}
          onKeyDown={handle_key_press}
        >
          <ThreadMessageEditor form={form} />
        </form>
      </Form>
    </div>
  );
};

type ThreadRunProps = {
  run: ExtendedRun;
};
const ThreadRun: React.FC<ThreadRunProps> = ({ run }) => {
  return (
    <div>
      <span className="text-xs text-muted-foreground">
        executing run {run.id}
      </span>
    </div>
  );
};
