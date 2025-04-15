import { db } from "@src/db/db";
import { files_table } from "@src/db/schema";
import cuid from "cuid";
import type { H } from "hono/types";
import { z } from "zod";

const thread_file_upload_request = z.object({
  name: z.string(),
  data: z.string(),
});

export const upload_thread_file: H = async c => {
  const thread_id = c.req.param("id");

  // parse body
  const body = await c.req.json();
  thread_file_upload_request.parse(body);
  const { name, data } = body as typeof thread_file_upload_request._type;

  // create db record
  const file: typeof files_table.$inferInsert = {
    id: cuid(),
    thread_id,
    name,
    data,
  };
  await db.insert(files_table).values(file);
  console.log(`created file ${file.id}`);
};
