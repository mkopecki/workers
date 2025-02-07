import type { RunStep } from "@src/types";

export type Logger = {
  log: (o: any) => void;
  error: (o: any) => void;
};

export const local_logger: Logger = {
  log: (o: any) => console.log(o),
  error: (o: any) => console.error(o),
};

export type ToolFunction =  {
  name: string;
  run: Function;
  openai_definition: any;
}

export type Tool = {
  id: string;
  name: string;
  functions: ToolFunction[];
};

export type ExecutionEngine = {
  register_run_step: (run_step: RunStep) => Promise<void>;
};

export const local_execution_engine: ExecutionEngine = {
  register_run_step: async (run_step: RunStep) => {
    console.log(`registering run step ${run_step.id}`);
    console.log(run_step);
  },
};
