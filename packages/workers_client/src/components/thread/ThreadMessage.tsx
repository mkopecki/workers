import { cn } from "@/lib/utils";
import type { RunStep, Message } from "workers_server/src/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { format_timestamp } from "@/utils/format_timestamp";
import { use_auth_store } from "@/auth/auth";
import { ClipboardCopy, GitBranch, Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { use_thread_data_store } from "./use_thread_data";

type ThreadMessageProps = {
  message: Message;
  reset_message_form: (content: string) => void;
};
export const ThreadMessage: React.FC<ThreadMessageProps> = ({
  message,
  reset_message_form,
}) => {
  const { user } = use_auth_store();

  const thread_data_store = use_thread_data_store();

  const action_jump_state = () => {
    thread_data_store.load_thread_state(message.thread_state_id);
    toast(`Loaded thread state ${message.thread_state_id}`);
  };
  const action_copy = () => {
    navigator.clipboard.writeText(message.content);
    toast("Copied content to clipboard.");
  };
  const action_edit = () => {
    reset_message_form(message.content);
  };

  const is_self = message.role === "user";
  const author = is_self ? user?.username : message.author;
  return (
    <div
      className={cn(
        "flex",
        "w-full",
        is_self ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "flex",
          "gap-4",
          is_self ? "flex-row-reverse" : "flex-row",
        )}
      >
        <Avatar>
          <AvatarImage src={user?.image_url} alt={user?.username} />
          <AvatarFallback
            className={cn(is_self ? "bg-slate-900" : "bg-blue-400")}
          >
            {is_self ? "U" : "W"}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            "flex",
            "flex-col",
            is_self ? "justify-end text-end" : "justify-start text-start",
          )}
        >
          <p className="text-xs text-muted-foreground">
            @{author} - {format_timestamp(message.created_at)}
          </p>
          <div className="prose prose-invert prose-headings:m-0">
            <Markdown
              remarkPlugins={[remarkMath, remarkGfm]}
              rehypePlugins={[rehypeKatex, rehypeRaw]}
              components={{ code: CodeBlock }}
            >
              {message.content.text}
            </Markdown>
          </div>
          <div
            className={cn(
              "flex flex-row",
              is_self ? "justify-end text-end" : "justify-start text-start",
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6"
              onClick={action_jump_state}
            >
              <GitBranch className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6"
              onClick={action_copy}
            >
              <ClipboardCopy className="w-4 h-4 text-muted-foreground" />
            </Button>

            {is_self && (
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={action_edit}
              >
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

type RunStepBadgeProps = {
  run_step: RunStep;
};
const RunStepBadge: React.FC<RunStepBadgeProps> = ({ run_step }) => {
  return <div className="">{run_step.run_id}</div>;
};

const CodeBlock = (props: any) => {
  const { children, className, ...rest } = props;
  const match = /language-(\w+)/.exec(className || "");
  return match ? (
    <SyntaxHighlighter
      {...rest}
      PreTag="div"
      children={String(children).replace(/\n$/, "")}
      language={match[1]}
      style={dark}
    />
  ) : (
    <code {...rest} className={className}>
      {children}
    </code>
  );
};
