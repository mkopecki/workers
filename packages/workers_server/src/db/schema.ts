import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const threads_table = sqliteTable("thread", {
  id: text().primaryKey(),
  name: text().notNull(),
  created_at: text().notNull(),

  worker_id: text().notNull(),
  worker_config: text({ mode: "json" }),
});

export const thread_states_table = sqliteTable("thread_state", {
  id: text().primaryKey(),
  created_at: text().notNull(),

  thread_id: text()
    .references(() => threads_table.id)
    .notNull(),

  previous_thread_state_id: text(),
});

export const runs_table = sqliteTable("run", {
  id: text().primaryKey(),
  created_at: text().notNull(),

  thread_id: text()
    .references(() => threads_table.id)
    .notNull(),
  thread_state_id: text()
    .references(() => thread_states_table.id)
    .notNull(),

  worker_id: text().notNull(),

  status: text({ enum: ["processing", "done", "error"] }).notNull(),
});

export const run_steps_table = sqliteTable("run_step", {
  id: text().primaryKey(),
  created_at: text().notNull(),

  run_id: text()
    .references(() => runs_table.id)
    .notNull(),

  description: text().notNull(),
});

export const messages_table = sqliteTable("message", {
  id: text().primaryKey(),
  created_at: text().notNull(),

  thread_state_id: text()
    .references(() => thread_states_table.id)
    .notNull(),
  thread_id: text()
    .references(() => threads_table.id)
    .notNull(),

  version: integer(),
  status: text({ enum: ["generating", "done"] }).notNull(),

  role: text({ enum: ["system", "assistant", "user"] }).notNull(),
  content: text().notNull(),
});
