import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

type ThreadMessageEditorProps = {
  form: any;
};

export const ThreadMessageEditor: React.FC<ThreadMessageEditorProps> = ({
  form,
}) => {
  return (
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
      <Button
        type="submit"
        className="w-24 h-full"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
        Send
      </Button>
    </div>
  );
};
