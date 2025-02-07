import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

type MessageEditorInputs = {
  message_content: string;
};
type ThreadMessageEditorProps = {
  on_submit: (data: MessageEditorInputs) => Promise<void>;
};

export const ThreadMessageEditor: React.FC<ThreadMessageEditorProps> = ({ on_submit }) => {
  const form = useForm<MessageEditorInputs>();

  const handle_submit = async (data) => {
    form.reset({ message_content: "" });
    await on_submit(data);
  };

  const handle_key_press = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(handle_submit)();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handle_submit)} onKeyPress={handle_key_press}>
        <div className="flex gap-4 p-4">
          <FormField
            control={form.control}
            name="message_content"
            render={({ field }) => (
              <FormItem className="grow">
                <FormControl>
                  <Textarea placeholder="Type your message here." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-24 h-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
            Send
          </Button>
        </div>
      </form>
    </Form>
  );
};
