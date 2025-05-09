import { db } from "@src/db";
import { users_table } from "@src/db/schema";
import type { H } from "hono/types";
import { eq } from "drizzle-orm";
import { balance } from "@src/balance";

export const get_user: H = async c => {
  const payload = c.get("jwtPayload");

  // retrieve user
  const { id } = payload;
  const [user] = await db
    .select({
      id: users_table.id,
      image_url: users_table.image_url,
      username: users_table.username,
      email: users_table.email,
      permissions: users_table.permissions,
    })
    .from(users_table)
    .where(eq(users_table.id, id));

  const user_balance = await balance.get(id);

  if (!user) {
    return c.json({ message: "user not found" }, 404);
  }

  return c.json({
    ...user,
    balance: user_balance,
  });
};
