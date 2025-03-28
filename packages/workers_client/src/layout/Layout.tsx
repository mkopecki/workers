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

const Navbar = () => {
  const threads_query = useQuery({
    queryKey: ["threads"],
    queryFn: workers_api_client.get_threads,
  });

  const { user } = use_auth();

  return (
    <div className="w-48 border-l flex flex-col">
      <div className="p-2">
        <Link to="/">
          <div className="flex flex-row gap-2 justify-center h-9 items-center">
            <img src={logo} className="h-4 w-4" />
            <h1 className="font-semibold text-lg">Workers</h1>
          </div>
        </Link>
      </div>
      <Separator />

      <div className="flex flex-col justify-center p-2">
        <Link to="/">
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

      <div className="p-2 grow">
        <span className="text-xs px-4 text-muted-foreground">Threads</span>
        <div>
          {threads_query?.data &&
            threads_query.data.map((t) => (
              <Link to={`/thread/${t.id}/messages`}>
                <Button
                  variant="ghost"
                  className="w-full justify-start font-normal text-xs"
                >
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

      <Separator />
      <div className="flex flex-col p-2 gap-2">
        {user?.type === "guest" && (
          <Link to="/signin">
            <Button className="w-full">Sign In</Button>
          </Link>
        )}
        <div className="flex flex-col text-xs px-4">
        <span className="text-muted-foreground">User</span>
        <span>
          {user?.type === "guest"
            ? `Guest #${user?.id.slice(-6)}`
            : user?.email}
        </span>
        <span>Balance: {user?.balance} Credits</span>
        </div>
      </div>
    </div>
  );
};
