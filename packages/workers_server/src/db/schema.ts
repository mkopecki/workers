import {
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const user_type = pgEnum("user_type", ["user", "guest"]);

export const users_table = pgTable("user", {
  id: text().primaryKey(),
  created_at: timestamp().defaultNow().notNull(),

  type: user_type().notNull(),

  image_url: text(),
  username: text(),
  email: text(),
  hashed_password: text(),

  permissions: text().array(),

  guest_id: text(),
});

export const balance_transactions_table = pgTable("balance_transaction", {
  id: text().primaryKey(),
  created_at: timestamp().defaultNow().notNull(),
  amount: integer(),
  user_id: text().references(() => users_table.id),
});

export const sessions_table = pgTable("session", {
  id: text().primaryKey(),
  created_at: timestamp().defaultNow().notNull(),
  user_id: text()
    .references(() => users_table.id)
    .notNull(),
});

export const threads_table = pgTable("thread", {
  id: text().primaryKey(),
  name: text().notNull(),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().notNull(),

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

  // TODO: add self-reference if possible
  previous_thread_state_id: text(),
});

export const run_status = pgEnum("run_status", ["processing", "done", "error"]);
export const runs_table = pgTable("run", {
  id: text().primaryKey(),
  created_at: timestamp().defaultNow().notNull(),

  thread_id: text()
    .references(() => threads_table.id)
    .notNull(),
  thread_state_id: text()
    .references(() => thread_states_table.id)
    .notNull(),

  model_id: text().notNull(),
  worker_id: text().notNull(),

  status: run_status().notNull(),
});

export const run_steps_table = pgTable("run_step", {
  id: text().primaryKey(),
  created_at: timestamp().defaultNow().notNull(),

  run_id: text()
    .references(() => runs_table.id)
    .notNull(),

  description: text().notNull(),
});

export const message_role = pgEnum("message_role", [
  "system",
  "assistant",
  "user",
]);
export const message_status = pgEnum("message_status", ["generating", "done"]);
export const messages_table = pgTable("message", {
  id: text().primaryKey(),
  created_at: timestamp().defaultNow().notNull(),

  thread_state_id: text()
    .references(() => thread_states_table.id)
    .notNull(),
  thread_id: text()
    .references(() => threads_table.id)
    .notNull(),

  version: integer(),
  status: message_status().notNull(),

  role: message_role().notNull(),
  author: text().notNull(),
  content: text().notNull(),
});
