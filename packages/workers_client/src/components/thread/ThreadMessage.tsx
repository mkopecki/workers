import { cn } from "@/lib/utils";
import type { RunStep, Message} from "workers_server/src/types";
import { Avatar, AvatarFallback } from "../ui/avatar";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { format_timestamp } from "@/utils/format_timestamp";

type ThreadMessageProps = {
  message: Message
};
export const ThreadMessage: React.FC<ThreadMessageProps> = ({
  message,
}) => {
  const is_self = message.role === "user";
  return (
    <div className={cn("flex", "w-full", is_self ? "justify-end" : "justify-start")}>
      <div className={cn("flex", "gap-4", is_self ? "flex-row-reverse" : "flex-row")}>
        <Avatar>
          <AvatarFallback className={cn(is_self ? "bg-slate-900" : "bg-blue-400")}>
            {is_self ? "U" : "W"}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            "flex",
            "flex-col",
            is_self ? "justify-end text-end" : "justify-start text-start"
          )}
        >
          <p className="text-xs text-muted-foreground">@{message.author} - {format_timestamp(message.created_at)}</p>
          <div className="prose prose-invert prose-headings:m-0">
            <Markdown
              remarkPlugins={[remarkMath, remarkGfm]}
              rehypePlugins={[rehypeKatex, rehypeRaw]}
              components={{ code: CodeBlock }}
            >
              {message.content}
            </Markdown>
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
