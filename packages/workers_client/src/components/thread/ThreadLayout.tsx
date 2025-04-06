import { Separator } from "@/components/ui/separator";
import { workers_api_client } from "@/workers_api_client";
import { Archive, Cog, MessagesSquare, Network, Trash } from "lucide-react";
import { Link, NavLink, Outlet, useParams } from "react-router";
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
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

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

  const query_client = useQueryClient();

  const delete_thread = async () => {
    await workers_api_client.delete_thread(thread_id);
    toast("Deleted thread.");
    query_client.invalidateQueries({ queryKey: ["threads"] });
  };
  const archive_thread = async () => {
    await workers_api_client.archive_thread(thread_id);
    toast("Archived thread.");
    query_client.invalidateQueries({ queryKey: ["threads"] });
  };

  useEffect(() => {
    load_data();
  }, [thread_id]);

  return (
    <div className="flex flex-col flex-1 overflow-y-auto h-full">
      <div className="flex justify-between p-2 h-12">
        <div className="flex gap-2 items-center">
          <NavLink to="messages">
            {({ isActive }) => (
              <Button
                variant="ghost"
                size="icon"
                className={cn(isActive && "bg-muted")}
              >
                <MessagesSquare className="h-4 w-4" />
              </Button>
            )}
          </NavLink>

          <NavLink to="tree">
            {({ isActive }) => (
              <Button
                variant="ghost"
                size="icon"
                className={cn(isActive && "bg-muted")}
              >
                <Network className="h-4 w-4" />
              </Button>
            )}
          </NavLink>

          <NavLink to="config">
            {({ isActive }) => (
              <Button
                variant="ghost"
                size="icon"
                className={cn(isActive && "bg-muted")}
              >
                <Cog className="h-4 w-4" />
              </Button>
            )}
          </NavLink>
        </div>
        <div className="flex gap-2 items-center" onClick={archive_thread}>
          <Button variant="ghost" size="icon">
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={delete_thread}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
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
function toast(arg0: string) {
  throw new Error("Function not implemented.");
}
