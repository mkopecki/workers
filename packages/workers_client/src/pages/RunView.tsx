import { workers_api_client } from "@/workers_api_client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { RunStep } from "workers_server/src/types";

export const RunView = () => {
  const { id } = useParams();
  const run_query = useQuery({
    queryKey: ["run", id],
    queryFn: () => workers_api_client.get_run(id),
  });
  const run_steps_query = useQuery({
    queryKey: ["run", id, "steps"],
    queryFn: () => workers_api_client.get_run_steps(id),
  });

  return (
    <div>
      <div>
        <p>{run_query.data?.id}</p>
        <p>{run_query.data?.status}</p>
      </div>
      {run_steps_query.data &&
        run_steps_query.data.map((run_step) => <RunStepView run_step={run_step} />)}
    </div>
  );
};

type RunStepViewProps = {
  run_step: RunStep;
};
const RunStepView: React.FC<RunStepViewProps> = ({ run_step }) => {
  return (
    <div>
      <p>{run_step.id}</p>
      <p>{run_step.description}</p>
    </div>
  );
};
