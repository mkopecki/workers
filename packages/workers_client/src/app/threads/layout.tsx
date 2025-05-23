import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { Link, NavLink, Outlet } from "react-router";
import { Separator } from "@/components/ui/separator";
import { workers_api_client } from "@/workers_api_client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Thread } from "workers_server/src/types";
import { format_timestamp } from "@/utils/format_timestamp";
import { Button } from "@/components/ui/button";
import { Archive, ChevronDown, Ellipsis, PlusIcon, Trash } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const ThreadsLayout = () => {
  return (
    <>
      <ResizablePanel
        defaultSize={20}
        maxSize={20}
        minSize={15}
        collapsedSize={0}
        collapsible={true}
        className="overflow-y-auto h-screen"
      >
        <Threads />
      </ResizablePanel>
      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={48} className="overflow-y-auto h-screen">
        <Outlet />
      </ResizablePanel>
    </>
  );
};

type WithDate = { updated_at: string | Date; [key: string]: any };
const group_by_days = <T extends WithDate>(items: T[]): Record<string, T[]> => {
  return items.reduce(
    (acc, item) => {
      // normalize to Date
      const date =
        typeof item.updated_at === "string"
          ? new Date(item.updated_at)
          : item.updated_at;
      // format as YYYY-MM-DD in local timezone
      const dayKey = date.toLocaleDateString("en-CA"); // "YYYY-MM-DD"

      if (!acc[dayKey]) {
        acc[dayKey] = [];
      }
      acc[dayKey].push(item);
      return acc;
    },
    {} as Record<string, T[]>,
  );
};

const Threads = () => {
  const active_threads_query = useQuery({
    queryKey: ["threads", "active"],
    queryFn: () => workers_api_client.get_threads("active"),
  });

  const archived_threads_query = useQuery({
    queryKey: ["threads", "archived"],
    queryFn: () => workers_api_client.get_threads("archived"),
  });

  return (
    <Tabs defaultValue="active">
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 h-12">
          <h1 className="text-xl font-bold">Threads</h1>

          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived">Archive</TabsTrigger>
          </TabsList>
        </div>
        <Separator />

        <Link to="/threads" className="p-2">
          <Button className="w-full">Create Thread</Button>
        </Link>

        <TabsContent value="active" className="flex-1 overflow-y-auto">
          <ScrollArea className="pt-2 flex flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2 p-2 pt-0 overflow-y-auto">
              {active_threads_query?.data &&
                Object.entries(group_by_days(active_threads_query.data))
                  .sort(([a_v], [b_v]) => b_v.localeCompare(a_v))
                  .map(([k, v]) => (
                    <div>
                      <Separator />
                      <p className="px-3 py-1 text-sm">{k}</p>
                      <div className="flex flex-col gap-1">
                        {v
                          .sort(
                            (a, b) =>
                              new Date(b.updated_at).getTime() -
                              new Date(a.updated_at).getTime(),
                          )
                          .map((t) => (
                            <ThreadCard key={t.id} thread={t} />
                          ))}
                        <Separator />
                      </div>
                    </div>
                  ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="archived">
          <ScrollArea className="pt-2">
            <div className="flex flex-col gap-1 p-1 pt-0">
              {archived_threads_query?.data &&
                archived_threads_query.data
                  .sort((a, b) => a.updated_at - b.updated_at)
                  .map((t) => <ThreadCard key={t.id} thread={t} />)}
            </div>
          </ScrollArea>
        </TabsContent>
      </div>
    </Tabs>
  );
};

const ThreadCard = ({ thread }: { thread: Thread }) => {
  const query_client = useQueryClient();

  const delete_thread = async () => {
    await workers_api_client.delete_thread(thread.id);
    toast("Deleted thread.");
    query_client.invalidateQueries({ queryKey: ["threads"] });
  };
  const archive_thread = async () => {
    await workers_api_client.archive_thread(thread.id);
    toast("Archived thread.");
    query_client.invalidateQueries({ queryKey: ["threads"] });
  };

  return (
    <NavLink to={`/threads/${thread.id}/messages`} className="flex flex-col">
      {({ isActive }) => (
        <button
          className={cn(
            "flex flex-row rounded-lg border px-3 py-1.5 text-sm transition-all hover:bg-accent",
            isActive && "bg-muted",
          )}
        >
          <div className="flex flex-col gap-0.5 justify-start text-start">
            <div
              className={cn(
                "text-xs",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {formatDistanceToNow(thread.updated_at)} ago - {thread.worker_id}
            </div>
            <div className="font-semibold">{thread.name}</div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto">
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={archive_thread}>
                  <Archive />
                  <span>Archive</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={delete_thread}>
                  <Trash />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </button>
      )}
    </NavLink>
  );
};
