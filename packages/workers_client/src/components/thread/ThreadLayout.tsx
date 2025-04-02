import { Separator } from "@/components/ui/separator";
import { workers_api_client } from "@/workers_api_client";
import { MessagesSquare, Network } from "lucide-react";
import { Link, Outlet, useParams } from "react-router";
import { Button } from "../ui/button";
import { format_timestamp } from "@/utils/format_timestamp";
import { use_thread_data_store } from "./use_thread_data";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { use_auth_store } from "@/auth/auth";

type ModelSelectItemProps = {
  model_id: string;
  model_name: string;
};
export const ModelSelectItem: React.FC<ModelSelectItemProps> = ({
  model_id,
  model_name,
}) => {
  const { user } = use_auth_store();

  if (user?.permissions?.includes(`can_access_${model_id}`)) {
    return <SelectItem value={model_id}>{model_name}</SelectItem>;
  } else {
    return (
      <SelectItem value={model_id} disabled>
        {model_name}
      </SelectItem>
    );
  }
};

const ModelSelector = () => {
  const { id: thread_id } = useParams();
  const thread_data_store = use_thread_data_store();

  const on_value_change = async (model_id: string) => {
    const thread = await workers_api_client.update_thread(thread_id!, {
      model_id,
    });
    console.log({ thread });
    if (thread) {
      thread_data_store.update_thread(thread);
    }
  };

  return (
    <Select
      value={thread_data_store?.thread_data?.worker_config?.model_id}
      onValueChange={(a) => on_value_change(a)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a timezone" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>OpenAI</SelectLabel>
          <ModelSelectItem
            model_id="openai_gpt_4o_mini"
            model_name="GPT-4o-mini"
          />
          <ModelSelectItem model_id="openai_gpt_4o" model_name="GPT-4o" />
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export const ThreadLayout = () => {
  const { id: thread_id } = useParams();

  const thread_data_store = use_thread_data_store();
  const { thread_data } = thread_data_store;

  const load_data = async () => {
    const new_thread_data = await workers_api_client.get_thread_data(thread_id);
    thread_data_store.load_thread_data(new_thread_data);

    const newest_state = new_thread_data.thread_states.at(-1);
    if (newest_state) {
      thread_data_store.load_thread_state(newest_state.id);
    }
  };

  useEffect(() => {
    load_data();
  }, [thread_id]);

  return (
    <div className="flex flex-col flex-1 overflow-y-auto border h-full">
      <div className="flex justify-between p-2">
        <div className="flex gap-2 items-center">
          <Link to="messages">
            <Button variant="ghost" size="icon">
              <MessagesSquare className="h-4 w-4" />
            </Button>
          </Link>

          <Link to="tree">
            <Button variant="ghost" size="icon">
              <Network className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <ModelSelector />
      </div>
      <Separator />

      <div className="flex p-4">
        <div className="grid gap-1">
          <span className="font-semibold">Thread: {thread_data?.name}</span>
          <div className="flex flex-row gap-2">
            <span className="text-xs text-muted-foreground">
              {thread_data?.id.slice(-6, -1)}
            </span>
            <span className="text-xs">{thread_data?.worker_id}</span>
          </div>
        </div>
        <div className="ml-auto text-xs text-muted-foreground">
          {format_timestamp(thread_data?.created_at)}
        </div>
      </div>
      <Separator />
      <Outlet />
    </div>
  );
};
