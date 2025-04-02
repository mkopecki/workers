import { Button, buttonVariants } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { MessagesSquare } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router";
import logo from "@/assets/logo.svg";
import { Separator } from "@/components/ui/separator";
import { workers_api_client } from "@/workers_api_client";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Thread } from "workers_server/src/types";
import { format_timestamp } from "@/utils/format_timestamp";

export const LayoutResizable = () => {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={15} maxSize={20} minSize={15}>
        <Nav />
      </ResizablePanel>
      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={20} maxSize={20}>
        <Threads />
      </ResizablePanel>
      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={48} className="overflow-y-auto h-screen">
        <Outlet />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

const Threads = () => {
  const threads_query = useQuery({
    queryKey: ["threads"],
    queryFn: workers_api_client.get_threads,
  });

  return (
    <div>
      <div className="flex items-center px-4 py-2 h-12">
        <h1 className="text-xl font-bold">Threads</h1>
      </div>
      <Separator />
      <ScrollArea className="pt-4">
        <div className="flex flex-col gap-2 p-2 pt-0">
          {threads_query?.data &&
            threads_query.data.map((t) => <ThreadCard thread={t} />)}
        </div>
      </ScrollArea>
    </div>
  );
};

const ThreadCard = ({ thread }: { thread: Thread }) => {
  return (
    <NavLink to={`/thread/${thread.id}/messages`} className="flex flex-col">
      {({ isActive }) => (
        <button
          className={cn(
            "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
            isActive && "bg-muted",
          )}
        >
          <div className="flex w-full flex-col gap-1">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="font-semibold">{thread.name}</div>
                <span className="flex h-2 w-2 rounded-full bg-blue-600" />
              </div>
              <div
                className={cn(
                  "ml-auto text-xs",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {format_timestamp(thread.created_at)}
              </div>
            </div>
            <div className="text-xs font-medium">{"Lorem Lorem"}</div>
          </div>
          <div className="line-clamp-2 text-xs text-muted-foreground">
            {"Lorem Lorem".substring(0, 300)}
          </div>
        </button>
      )}
    </NavLink>
  );
};

const Nav = () => {
  return (
    <div className="group flex flex-col gap-4 py-2">
      <nav className="grid gap-1 px-2">
        <div className="px-4">
          <Link to="/">
            <div className="flex flex-row gap-2 justify-start h-9 items-center">
              <img src={logo} className="h-4 w-4" />
              <h1 className="font-semibold text-lg">Sophia</h1>
            </div>
          </Link>
        </div>
        <Separator />

        <Link to="/">
          <Button variant="ghost" className="w-full justify-start text-sm">
            <MessagesSquare className="mr-2 h-4 w-4" />
            Threads
          </Button>
        </Link>
      </nav>
    </div>
  );
};
