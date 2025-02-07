import { workers_api_client } from "@/workers_api_client";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import type { Run } from "workers_server/src/types";

type RunRowProps = {
  run: Run;
};
const RunRow: React.FC<RunRowProps> = ({ run }) => {
  return (
    <div className="flex flex-col">
      <Link to={`/run/${run.id}`}>{run.id}</Link>
    </div>
  );
};

export const ThreadRuns = () => {
  const { id } = useParams();
  const query = useQuery({
    queryKey: ["thread", id, "runs"],
    queryFn: () => workers_api_client.get_thread_runs(id),
  });

  return <>{query.data && query.data.map((run) => <RunRow run={run} />)}</>;
};
