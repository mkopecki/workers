import { sum, eq } from "drizzle-orm";
import { db } from "./db/db";
import { balance_transactions_table } from "./db/schema";
import type { User } from "./types";
import cuid from "cuid";

const get = async (user_id: string): Promise<number> => {
  const [{ balance }] = await db
    .select({ balance: sum(balance_transactions_table.amount) })
    .from(balance_transactions_table)
    .where(eq(balance_transactions_table.user_id, user_id));

  return Number(balance);
};

const verify = async (user_id: string, charge: number) => {
  const balance = await get(user_id);

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
