import type { H } from "hono/types";
import { workers } from ".";
import { zodToJsonSchema } from "zod-to-json-schema";

export const get_workers: H = async c => {
  const workers_list = Object.values(workers).map(w => {
    const { id, config_schema } = w;
    const config_schema_json = zodToJsonSchema(config_schema, "config_schema");

    return {
      id,
      config_schema_json,
    };
  });

  return c.json(workers_list);
};
