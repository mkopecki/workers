import { workers } from "@src/workers/workers";
import type { H } from "hono/types";

export const get_workers: H = async c => {
  const workers_list = Object.values(workers).map(w => {
    const { id, config_schema } = w;

    return {
      id,
      config_schema,
    };
  });

  return c.json(workers_list);
};
