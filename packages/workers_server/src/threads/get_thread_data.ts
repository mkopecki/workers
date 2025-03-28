import { db } from "@src/db/db";
import {
  messages_table,
  run_steps_table,
  runs_table,
  thread_states_table,
  threads_table,
} from "@src/db/schema";
import type { ThreadData } from "@src/types";
import { eq } from "drizzle-orm";
import type { H } from "hono/types";

export const get_thread_data: H = async c => {
  const thread_id = c.req.param("id");

  // retrieve data
  const threads_promise = db
    .select()
    .from(threads_table)
    .where(eq(threads_table.id, thread_id));

  const thread_states_promise = db
    .select()
    .from(thread_states_table)
    .where(eq(thread_states_table.thread_id, thread_id));

  const messages_promise = db
    .select()
    .from(messages_table)
    .where(eq(messages_table.thread_id, thread_id));

  const runs_promise = db
    .select()
    .from(runs_table)
    .where(eq(runs_table.thread_id, thread_id));

  const run_steps_promise = db
    .select()
    .from(run_steps_table)
    .innerJoin(runs_table, eq(runs_table.id, run_steps_table.run_id))
    .where(eq(runs_table.thread_id, thread_id));

  const [threads, thread_states, messages, runs, extended_run_steps] =
    await Promise.all([
      threads_promise,
      thread_states_promise,
      messages_promise,
      runs_promise,
      run_steps_promise,
    ]);

  // access control
  const [thread] = threads;
  const user_id = c.get("jwtPayload")["id"];
  if (user_id !== thread.user_id) {
    return c.json({ message: "Not found." }, 404);
  }

  // build thread data object
  const run_steps = extended_run_steps.map(x => x.run_step);
  const grouped_run_steps = group_by(run_steps, "run_id");

  const grouped_runs = group_by(runs, "thread_state_id");
  const grouped_messages = group_by(messages, "thread_state_id");

  const extended_thread_states = thread_states.map(ts => ({
    ...ts,
    runs:
      grouped_runs[ts.id]?.map(r => ({
        ...r,
        run_steps: grouped_run_steps[r.id] ?? [],
      })) ?? [],
    messages: grouped_messages[ts.id] ?? [],
  }));

  const thread_data: ThreadData = {
    ...thread,
    thread_states: extended_thread_states,
  };

  return c.json(thread_data);
};

function group_by<T, K extends keyof T>(
  items: T[],
  key: K
): { [group: string]: T[] } {
  return items.reduce(
    (acc, item) => {
      // Convert the grouping key to a string, since object keys are strings
      const groupKey = String(item[key]);
      acc[groupKey] = acc[groupKey] || [];
      acc[groupKey].push(item);
      return acc;
    },
    {} as { [group: string]: T[] }
  );
}
