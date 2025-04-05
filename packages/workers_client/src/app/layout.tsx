import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TerminalSquare } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router";
import logo from "@/assets/logo.svg";
import { Separator } from "@/components/ui/separator";
import { use_auth_guard } from "@/auth/use_auth_guard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { use_auth_store } from "@/auth/auth";
import { cn } from "@/lib/utils";

export const RootLayout = () => {
  use_auth_guard();

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={15} maxSize={15} minSize={15}>
        <Nav />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <Outlet />
    </ResizablePanelGroup>
  );
};

const Nav = () => {
  const { user } = use_auth_store();

  return (
    <nav className="flex flex-col bg-sidebar h-full px-2">
      <div className="px-4 h-12 py-2 flex items-center">
        <Link to="/">
          <div className="flex flex-row gap-2 justify-start items-center">
            <img src={logo} className="h-4 w-4" />
            <h1 className="font-semibold text-lg">Sophia</h1>
          </div>
        </Link>
      </div>
      <Separator />

      <div className="flex flex-1 flex-col py-4 px-2">
        <div className="h-8 items-center text-xs font-medium text-ghost px-2">
          Platform
        </div>
        <ul className="flex flex-col gap-1 h-8 text-sm">
          <li>
            <NavLink
              to="/threads"
              className={(isActive) =>
                cn(
                  "flex items-center gap-2 p-2 hover:bg-sidebar-accent",
                  isActive && "bg-sidebar-accent",
                )
              }
            >
              <TerminalSquare className="h-4 w-4" />
              <span>Threads</span>
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <Avatar>
              <AvatarImage src={user?.image_url} alt={user?.username} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm">
            <span className="font-semibold">{user?.username}</span>
            <span className="text-xs">{user?.email}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
