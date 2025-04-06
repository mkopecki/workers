import { SubmitHandler, useForm } from "react-hook-form";
import { useParams } from "react-router";
import { use_thread_data_store } from "./use_thread_data";
import { Form } from "../ui/form";
import { WorkerConfigSubform } from "./WorkerConfigForm";
import { workers_api_client } from "@/workers_api_client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { toast } from "sonner";

export const ThreadConfig = () => {
  const { id } = useParams();
  const { thread_data } = use_thread_data_store();

  const form = useForm();

  const workers_query = useQuery({
    queryKey: ["workers"],
    queryFn: workers_api_client.get_workers,
  });

  if (!workers_query.data) return null;

  const worker = workers_query.data.find(
    (w) => w.id === thread_data?.worker_id,
  );

  const on_submit: SubmitHandler<any> = async (worker_config: any) => {
    await workers_api_client.update_thread(id, worker_config);
    toast("Worker config has been updated.");
  };

  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(on_submit)} className="grid gap-4">
          {worker && (
            <WorkerConfigSubform
              form={form}
              config_schema_json={worker.config_schema_json}
            />
          )}

          <Button type="submit">Update Config</Button>
        </form>
      </Form>
    </div>
  );
};
