import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type ChatWorkerCreationForm = {
  form: any;
};
export const ChatWorkerConfigCreationForm: React.FC<ChatWorkerCreationForm> = ({ form }) => {
  return (
    <>
      <ModelSelectionForm form={form} />
    </>
  );
};

const models = ["openai_gpt_4o_mini", "openai_gpt_4o"];

type ModelSelectionFormProps = {
  form: any;
};
const ModelSelectionForm: React.FC<ModelSelectionFormProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="worker_config.model_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Model</FormLabel>
          <FormControl>
            <Select required onValueChange={field.onChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
