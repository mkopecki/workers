import { db } from "@src/db";
import { run_steps_table } from "@src/db/schema";
import type { H } from "hono/types";
import cuid from "cuid";
import { z } from "zod";

const run_step_data = z.object({
  description: z.string(),
});

export const create_run_step: H = async c => {
  const run_id = c.req.param("id");

  const data = await c.req.json<typeof run_step_data._type>();
  run_step_data.parse(data);

  // pull run from databas
  const run_step: typeof run_steps_table.$inferInsert = {
    id: cuid(),
    run_id,
    description: data.description,
  };
  await db.insert(run_steps_table).values(run_step);

  return c.text("success");
};
