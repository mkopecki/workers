import {
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// auth
export const users_table = pgTable("user", {
  id: text().primaryKey(),
  created_at: timestamp().defaultNow().notNull(),
  image_url: text(),
  username: text(),
  email: text(),
  hashed_password: text(),
  permissions: text().array(),
});

export const balance_transactions_table = pgTable("balance_transaction", {
  id: text().primaryKey(),
  created_at: timestamp().defaultNow().notNull(),
  amount: integer(),
  user_id: text().references(() => users_table.id),
});

// thread
export const thread_status = pgEnum("thread_status", [
  "active",
  "archived",
  "deleted",
]);
export const threads_table = pgTable("thread", {
  id: text().primaryKey(),
  name: text().notNull(),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().notNull(),

  status: thread_status().notNull().default("active"),

  worker_id: text().notNull(),
  worker_config: json(),

  user_id: text()
    .references(() => users_table.id)
    .notNull(),
});

export const thread_states_table = pgTable("thread_state", {
  id: text().primaryKey(),
  created_at: timestamp().defaultNow().notNull(),
  thread_id: text()
    .references(() => threads_table.id)
    .notNull(),
  previous_thread_state_id: text(),
});

export const message_role = pgEnum("message_role", [
  "system",
  "assistant",
  "user",
]);
export const messages_table = pgTable("message", {
  id: text().primaryKey(),
  created_at: timestamp().defaultNow().notNull(),

  thread_state_id: text()
    .references(() => thread_states_table.id)
    .notNull(),
  thread_id: text()
    .references(() => threads_table.id)
    .notNull(),

  role: message_role().notNull(),
  author: text().notNull(),
  content: json(),
});

// runs
export const run_status = pgEnum("run_status", [
  "queued",
  "processing",
  "success",
  "error",
]);
export const runs_table = pgTable("run", {
  id: text().primaryKey(),
  created_at: timestamp().defaultNow().notNull(),

  worker_id: text().notNull(),
  status: run_status().notNull(),

  config: json(),
  args: json(),
});

export const run_steps_table = pgTable("run_step", {
  id: text().primaryKey(),
  created_at: timestamp().defaultNow().notNull(),

  run_id: text()
    .references(() => runs_table.id)
    .notNull(),

  description: text().notNull(),
});

// file tooling
export const files_table = pgTable("file", {
  id: text().primaryKey(),
  created_at: timestamp().defaultNow().notNull(),

  thread_id: text()
    .references(() => threads_table.id)
    .notNull(),

  name: text().notNull(),
  // base64 data
  data: text().notNull(),
});
