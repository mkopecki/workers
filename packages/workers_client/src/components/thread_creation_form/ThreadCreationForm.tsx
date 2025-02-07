import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { workers_api_client } from "@/workers_api_client";
import { useQueryClient } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { CreateThreadArgs } from "workers_server/src/routes/create_thread";
import { ChatWorkerConfigCreationForm } from "./ChatWorkerCreationForm";

const workers = ["basic_chat_worker"];
const worker_config_components = {
  basic_chat_worker: ChatWorkerConfigCreationForm,
};

export const ThreadCreationForm = () => {
  const form = useForm<CreateThreadArgs>();
  const worker_id = form.watch("worker_id");
  const WorkerConfig = worker_id in worker_config_components && worker_config_components[worker_id];

  const navigate = useNavigate();

  const query_client = useQueryClient();
  const onSubmit: SubmitHandler<CreateThreadArgs> = async (data) => {
    await workers_api_client.create_thread(data);
    query_client.invalidateQueries({ queryKey: ["threads"] });
    navigate("/");
  };

  return (
    <div className="flex flex-col gap-2">
      <Form {...form}>
        <form className="flex flex-col gap-2" onSubmit={form.handleSubmit(onSubmit)}>
          <h1 className="text-xl">Thread</h1>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thread Name</FormLabel>
                <FormControl>
                  <Input required placeholder="Session Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />
          <h1 className="text-xl">Worker</h1>
          <FormField
            control={form.control}
            name="worker_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Worker</FormLabel>
                <FormControl>
                  <Select required onValueChange={field.onChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a worker" />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.map((w) => (
                        <SelectItem value={w}>{w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {worker_id && <WorkerConfig form={form}/>}

          <Button type="submit">Create Thread</Button>
        </form>
      </Form>
    </div>
  );
};
