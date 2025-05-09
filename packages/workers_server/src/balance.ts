import { sum, eq } from "drizzle-orm";
import { db } from "@src/db";
import { balance_transactions_table, users_table } from "@src/db/schema";
import cuid from "cuid";
import type { User } from "./types";
import { permissions } from "./auth/permissions";

const get = async (user_id: string): Promise<number> => {
  const [{ balance }] = await db
    .select({ balance: sum(balance_transactions_table.amount) })
    .from(balance_transactions_table)
    .where(eq(balance_transactions_table.user_id, user_id));

  return Number(balance);
};

const get_user = async (user_id: string): Promise<User> => {
  const [user] = await db
    .select()
    .from(users_table)
    .where(eq(users_table.id, user_id));
  return user;
};

const verify = async (user_id: string, charge: number) => {
  const balance = await get(user_id);
  const user = await get_user(user_id);

  if (user?.permissions?.includes(permissions.no_balance.id)) {
    return true;
  }

  if (balance < charge) {
    throw new Error(`insufficient balance for user ${user_id}`);
  }
};

const modify = async (user_id: string, amount: number) => {
  const balance_transaction: typeof balance_transactions_table.$inferInsert = {
    id: cuid(),
    user_id: user_id,
    amount: amount,
  };
  await db.insert(balance_transactions_table).values(balance_transaction);
  console.log(`created new balance transaction`);
};

export const balance = {
  get,
  verify,
  modify,
};
