import type { ZodSchema } from "zod";
import type { Run } from "../types";
import { openai_worker } from "./openai/openai_worker";
import { openai_reasoning_worker } from "./openai/openai_reasoning_worker";

type AvailableWorkers = keyof typeof workers;

export const get_worker = (id: string): Worker<any> => {
  return workers[id as AvailableWorkers];
};

export type Worker<T> = {
  id: string;
  config_schema: ZodSchema;
  run: (config: T, run: Run) => Promise<void>;
};

export const workers = {
  openai_worker,
  openai_reasoning_worker,
};
