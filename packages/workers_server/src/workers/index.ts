import type { Run } from "../types";
import { basic_chat_worker } from "./basic_chat_worker";

const workers = {
  basic_chat_worker,
};

type AvailableWorkers = keyof typeof workers;

export const get_worker = (id: string): Worker<any> => {
  return workers[id as AvailableWorkers];
};

export type Worker<T> = {
  id: string;
  run: (config: T, run: Run) => Promise<void>;
};
