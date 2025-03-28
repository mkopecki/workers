import { useForm } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Form,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import {
  SelectTrigger,
  Select,
  SelectContent,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "../ui/select";
import { ModelSelectItem } from "./ThreadLayout";
import { workers_api_client } from "@/workers_api_client";
import { useNavigate } from "react-router";
import { use_thread_data } from "./use_thread_data";

type NewThreadData = {
  model_id: string;
  message: string;
};

export const NewThread: React.FC = () => {
  const form = useForm<NewThreadData>();
  const navigate = useNavigate();

  const { thread_data_store, create_message } = use_thread_data();

  const on_submit: SubmitHandler<NewThreadData> = async (data) => {
    // create thread
    const { thread, thread_state } = await workers_api_client.create_thread({
      name: "Test",
      worker_id: "basic_chat_worker",
      worker_config: {
        model_id: data.model_id,
      },
    });

    const message_thread_state = await workers_api_client.create_message(
      thread.id,
      {
        content: data.message,
        current_thread_state_id: thread_state.id,
      },
    );

    const run_thread_state = await workers_api_client.create_run({
      thread_id: thread.id,
      current_thread_state_id: message_thread_state.id,
    });

    await navigate(`/thread/${thread.id}/messages`);
  };

  return (
    <div className="flex w-full h-full p-6 justify-center items-center">
      <Form {...form}>
        <form
          className="flex flex-col gap-4 w-full"
          onSubmit={form.handleSubmit(on_submit)}
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

            <FormField
              control={form.control}
              name="model_id"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select required onValueChange={field.onChange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>OpenAI</SelectLabel>
                          <ModelSelectItem
                            model_id="openai_gpt_4o_mini"
                            model_name="GPT-4o-mini"
                          />
                          <ModelSelectItem
                            model_id="openai_gpt_4o"
                            model_name="GPT-4o"
                          />
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
};
