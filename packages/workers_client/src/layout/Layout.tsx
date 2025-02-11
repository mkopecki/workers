import { Link, Outlet } from "react-router";
import logo from "@/assets/logo.svg";
import { Button } from "@/components/ui/button";
import { MessagesSquare, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { workers_api_client } from "@/workers_api_client";
import { Separator } from "@/components/ui/separator";
import { use_thread_data_store } from "@/components/thread/use_thread_data";
import { format_timestamp } from "@/utils/format_timestamp";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { use_auth } from "@/auth/use_auth";

export const Layout = () => {
  return (
    <div className="h-screen w-full flex justify-center p-4 pt-0 overflow-y-auto">
      <Navbar />
      <div className="max-w-screen-md w-full">
        <Outlet />
      </div>
    </div>
  );
};

const StateBar = () => {
  const thread_data_store = use_thread_data_store();

  const state_container_ref = useRef(null);
  useEffect(() => {
    if (state_container_ref.current) {
      state_container_ref.current.scrollTop = state_container_ref.current.scrollHeight;
    }
  }, [thread_data_store.thread_data]);

  return (
    <div className="w-48 border-r flex flex-col overflow-y-auto">
      <div className="flex flex-co overflow-y-auto">
        <div
          className="flex flex-col justify-center p-2 gap-4 overflow-y-auto"
          ref={state_container_ref}
        >
          {thread_data_store.thread_data?.thread_states.map((s) => {
            const is_selected = thread_data_store.thread_state?.id === s.id;
            return (
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start font-normal py-5",
                  is_selected ? "bg-slate-700" : ""
                )}
                onClick={() => thread_data_store.load_thread_state(s.id)}
              >
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    {format_timestamp(s.created_at)}
                  </span>
                  <div className="flex flex-row gap-2">
                    <span className="text-xs">{s.id.slice(-6)}</span>
                    {s.previous_thread_state_id ? (
                      <span className="text-xs text-muted-foreground">
                        → {s.previous_thread_state_id.slice(-6)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const threads_query = useQuery({
    queryKey: ["threads"],
    queryFn: workers_api_client.get_threads,
  });

  const { user } = use_auth();

  return (
    <div className="w-48 border-l flex flex-col">
      <div className="p-2">
        <div className="flex flex-row gap-2 justify-center h-9 items-center">
          <img src={logo} className="h-4 w-4" />
          <h1 className="font-semibold text-lg">Workers</h1>
        </div>
      </div>
      <Separator />

      <div className="flex flex-col p-2">
        <span className="text-xs px-4 text-muted-foreground">User</span>
        <span className="text-xs px-4">
          {user?.type === "guest" ? `Guest #${user?.id.slice(-6)}` : user?.email}
        </span>
        {user?.type === "guest" && (
          <Link to="/signin">
            <Button>Sign In</Button>
          </Link>
        )}
      </div>
      <Separator />

      <div className="flex flex-col">
        <div className="flex flex-col justify-center p-2">
          <Link to="/thread/create">
            <Button variant="ghost" className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4 font-normal" />
              Create Thread
            </Button>
          </Link>

          <Link to="/">
            <Button variant="ghost" className="w-full justify-start">
              <MessagesSquare className="mr-2 h-4 w-4 font-normal" />
              Threads
            </Button>
          </Link>
        </div>

        <div className="p-2">
          <span className="text-xs px-4 text-muted-foreground">Threads</span>
          <div>
            {threads_query?.data &&
              threads_query.data.map((t) => (
                <Link to={`/thread/${t.id}/messages`}>
                  <Button variant="ghost" className="w-full justify-start font-normal text-xs">
                    <div className="flex flex-col text-start">
                      <span className="text-xs text-muted-foreground">
                        {format_timestamp(t.created_at)}
                      </span>
                      <span>{t.name}</span>
                    </div>
                  </Button>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
