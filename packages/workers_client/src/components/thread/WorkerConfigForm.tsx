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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const SelectInput = ({ form, values, name }) => {
  return (
    <FormField
      control={form.control}
      name={"worker_config." + name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{name}</FormLabel>
          <FormControl>
            <Select required onValueChange={field.onChange}>
              <SelectTrigger className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {values.map((v) => (
                  <SelectItem value={v}>{v}</SelectItem>
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

export const WorkerConfig = ({
  config_schema_json,
}: {
  config_schema_json: string;
}) => {
  const form = useForm();

  const on_submit: SubmitHandler<any> = async (data: any) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(on_submit)}></form>
    </Form>
  );
};

export const WorkerConfigSubform = ({ form, config_schema_json }) => {
  const config_properties =
    config_schema_json.definitions.config_schema.properties;

  return (
    <div>
      {Object.entries(config_properties).map(([name, p]) => {
        if (p.type === "string") {
          if ("const" in p) {
            return <SelectInput form={form} name={name} values={[p.const]} />;
          } else if ("enum" in p) {
            return <SelectInput form={form} name={name} values={p.enum} />;
          }
        }
      })}
    </div>
  );
};
