import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { workers_api_client } from "@/workers_api_client";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router";
import { Thread } from "workers_server/src/types";

export const ThreadList: React.FC = () => {
  const query = useQuery({ queryKey: ["threads"], queryFn: workers_api_client.get_threads });

  return (
    <div className="flex flex-col gap-2 flex-1">
      <div className="flex flex-row gap-2 justify-between items-center">
        <h1 className="text-xl">Threads</h1>
        <Link to="/thread/create">
          <Button size="icon">
            <Plus />
          </Button>
        </Link>
      </div>
      <Separator />
      <div className="flex flex-col gap-4">
        {query.data?.map((t) => <ThreadRow key={t.id} thread={t} />)}
      </div>
    </div>
  );
};

type Props = {
  thread: Thread;
};

const format_date = (date_iso: string) => {
  return date_iso.substring(0, 10);
};

const ThreadRow: React.FC<Props> = ({ thread }) => {
  return (
    <Link className="flex flex-row justify-between px-2" to={`/thread/${thread.id}/messages`}>
      <div className="flex flex-row gap-3">
        <p>{format_date(thread.created_at)}</p>
        <p className="font-bold">{thread.name}</p>
        <p className="text-slate-300">{thread.worker_id}</p>
      </div>
      <ChevronRight />
    </Link>
  );
};
