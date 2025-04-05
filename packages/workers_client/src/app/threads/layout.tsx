import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { Link, NavLink, Outlet } from "react-router";
import { Separator } from "@/components/ui/separator";
import { workers_api_client } from "@/workers_api_client";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Thread } from "workers_server/src/types";
import { format_timestamp } from "@/utils/format_timestamp";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export const ThreadsLayout = () => {
  return (
    <>
      <ResizablePanel defaultSize={20} maxSize={20}>
        <Threads />
      </ResizablePanel>
      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={48} className="overflow-y-auto h-screen">
        <Outlet />
      </ResizablePanel>
    </>
  );
};

const Threads = () => {
  const threads_query = useQuery({
    queryKey: ["threads"],
    queryFn: workers_api_client.get_threads,
  });

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2 h-12">
        <h1 className="text-xl font-bold">Threads</h1>

        <Link to="/threads">
          <Button size="icon">
            <PlusIcon />
          </Button>
        </Link>
      </div>
      <Separator />
      <ScrollArea className="pt-4">
        <div className="flex flex-col gap-2 p-2 pt-0">
          {threads_query?.data &&
            threads_query.data
              .sort((a, b) => a.updated_at - b.updated_at)
              .map((t) => <ThreadCard key={t.id} thread={t} />)}
        </div>
      </ScrollArea>
    </div>
  );
};

const ThreadCard = ({ thread }: { thread: Thread }) => {
  return (
    <NavLink to={`/threads/${thread.id}/messages`} className="flex flex-col">
      {({ isActive }) => (
        <button
          className={cn(
            "flex flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left text-sm transition-all hover:bg-accent",
            isActive && "bg-muted",
          )}
        >
          <div className="flex w-full flex-col gap-1">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="font-semibold">{thread.name}</div>
              </div>
              <div
                className={cn(
                  "ml-auto text-xs",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {format_timestamp(thread.updated_at)}
              </div>
            </div>
          </div>

          <div className="line-clamp-2 text-xs text-muted-foreground">
            {thread.worker_id} w/ {thread.worker_config.model_id}
          </div>
        </button>
      )}
    </NavLink>
  );
};
