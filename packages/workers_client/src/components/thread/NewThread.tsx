import { Separator } from "@radix-ui/react-separator";
import { ThreadMessageEditor } from "./ThreadMessageEditor";
import { SubmitHandler, useForm } from "react-hook-form";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useQuery } from "@tanstack/react-query";
import { workers_api_client } from "@/workers_api_client";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { WorkerConfigSubform } from "./WorkerConfigForm";
import { useNavigate } from "react-router";

type FormData = {
  worker_id: string;
  message_content: string;
};

export const NewThread = () => {
  const workers_query = useQuery({
    queryKey: ["workers"],
    queryFn: workers_api_client.get_workers,
  });

  const form = useForm<FormData>();
  const worker_id = form.watch("worker_id");
  const worker = workers_query.data?.find((w) => w.id === worker_id);

  const navigate = useNavigate();
  const on_submit: SubmitHandler<FormData> = async (data: any) => {
    const { thread, thread_state } = await workers_api_client.create_thread({
      name: "No Name",
      worker_id: data.worker_id,
      worker_config: {
        ...data.worker_config,
      },
    });

    const message_thread_state = await workers_api_client.create_message(
      thread.id,
      {
        content: data.message_content,
        current_thread_state_id: thread_state.id,
      },
    );

    await workers_api_client.create_run({
      thread_id: thread.id,
      current_thread_state_id: message_thread_state.id,
    });

    await navigate(`/threads/${thread.id}/messages`);
  };

  console.log(worker);

  return (
    <div className="flex flex-col h-full gap-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(on_submit)}
          className="flex flex-col gap-2 h-full"
        >
          <div className="flex-1 flex items-end">
            <div className="flex gap-4 p-4 items-end">
              <ScrollArea className="flex flex-col gap-2 p-4 border rounded-mg">
                <h4 className="mb-4 text-sm font-medium leadining-none">
                  Workers
                </h4>

                <FormField
                  control={form.control}
                  name="worker_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          {workers_query.data &&
                            workers_query.data.map((w) => (
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={w.id} />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {w.name}
                                </FormLabel>
                              </FormItem>
                            ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </ScrollArea>

              {worker && (
                <div className="flex flex-col gap-2 p-4 border rounded-mg">
                  <WorkerConfigSubform
                    form={form}
                    config_schema={worker.config_schema}
                  />
                </div>
              )}
            </div>
          </div>
          <Separator />
          <ThreadMessageEditor form={form} />
        </form>
      </Form>
    </div>
  );
};
