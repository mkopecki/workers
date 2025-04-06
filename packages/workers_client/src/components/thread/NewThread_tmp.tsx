import { useQuery } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { workers_api_client } from "@/workers_api_client";
import { WorkerConfigSubform } from "./WorkerConfigForm";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { useNavigate } from "react-router";

export const NewThread = () => {
  const workers_query = useQuery({
    queryKey: ["workers"],
    queryFn: workers_api_client.get_workers,
  });

  const form = useForm();
  const worker_id = form.watch("worker_id");

  const navigate = useNavigate();

  const on_submit: SubmitHandler<any> = async (data: any) => {
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
        content: data.message,
        current_thread_state_id: thread_state.id,
      },
    );

    await workers_api_client.create_run({
      thread_id: thread.id,
      current_thread_state_id: message_thread_state.id,
    });

    await navigate(`/threads/${thread.id}/messages`);
  };

  if (!workers_query.data) return null;

  const work = workers_query.data.find((w) => w.id === worker_id);

  return (
    <div className="flex w-full h-full p-6 justify-center items-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(on_submit)}
          className="grid gap-4 w-full"
        >
          <h1 className="text-center text-2xl">Start a Chat</h1>
          <div className="flex flex-col gap-2">
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="grow">
                    <FormControl>
                      <Textarea
                        placeholder="Type your message here."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-24 h-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="animate-spin" />
                )}
                Send
              </Button>
            </div>

            <div className="flex justify-center">
              <div className="flex flex-col gap-2 border p-2 rounded-lg">
                <p>Worker Configuration </p>
                <div className="flex flex-row gap-4">
                  <FormField
                    control={form.control}
                    name="worker_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>worker_id</FormLabel>
                        <FormControl>
                          <Select required onValueChange={field.onChange}>
                            <SelectTrigger className="w-[220px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {workers_query.data.map((w) => (
                                <SelectItem value={w.id}>{w.id}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-6">
                    {work && (
                      <WorkerConfigSubform
                        form={form}
                        config_schema_json={work.config_schema_json}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};
