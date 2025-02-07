import { workers_api_client } from "@/workers_api_client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { ThreadMessage } from "./ThreadMessage";
import { Separator } from "../ui/separator";
import { ThreadMessageEditor } from "./ThreadMessageEditor";
import { useMessageCreator } from "./useMessageCreator";
import { useEffect, useRef } from "react";
import { use_thread_data } from "./use_thread_data";
import { ExtendedRun, ThreadState } from "workers_server/src/types";
import { Button } from "../ui/button";

export const ThreadChat = () => {
  const { id } = useParams();

  const { thread_data_store, create_message } = use_thread_data(id);

  const on_submit = async (data: any) => {
    await create_message(data.message_content);
  };

  // ensure we auto scroll to the bottom
  const message_container_ref = useRef(null);
  useEffect(() => {
    if (message_container_ref.current) {
      message_container_ref.current.scrollTop = message_container_ref.current.scrollHeight;
    }
  }, [thread_data_store.thread_state_history]);

  const on_thread_state_select = (thread_state_id: string) => {
    thread_data_store.load_thread_state(thread_state_id);
  };

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <div className="flex flex-1 flex-col p-4 gap-4 overflow-y-auto" ref={message_container_ref}>
        {/*thread_data && thread_data.messages.map((m) => <ThreadMessage key={m.id} message={m} />)*/}
        {thread_data_store.thread_state_history.flatMap((s) => s.messages.map((m) => <ThreadMessage key={m.id} message={m}/>))}
      </div>
      <Separator />
      <ThreadMessageEditor on_submit={on_submit} />
    </div>
  );
};

type ThreadRunProps = {
  run: ExtendedRun;
};
const ThreadRun: React.FC<ThreadRunProps> = ({ run }) => {
  return (
    <div>
      <span className="text-xs text-muted-foreground">executing run {run.id}</span>
    </div>
  );
};
