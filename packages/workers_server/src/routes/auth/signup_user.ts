import { db } from "@src/db/db";
import { users_table } from "@src/db/schema";
import type { H } from "hono/types";
import { z } from "zod";
import { eq } from "drizzle-orm";
import cuid from "cuid";
import { genSalt, hash } from "bcrypt";

const SignUpUserArgs = z.object({
  email: z.string(),
  password: z.string(),
});

export const signup_user: H = async c => {
  // validate data
  const data = await c.req.json<z.infer<typeof SignUpUserArgs>>();
  SignUpUserArgs.parse(data);
  const { email, password } = data;

  // check if user already exists
  const existing_users = await db
    .select()
    .from(users_table)
    .where(eq(users_table.email, email));

  if (existing_users.length !== 0) {
    throw new Error("user already exists");
  }

  // create user record
  const salt = await genSalt(10);
  const hashed_password = await hash(password, salt);

  const user: typeof users_table.$inferInsert = {
    id: cuid(),
    type: "user",
    email,
    hashed_password,
  };
  await db.insert(users_table).values(user);
  console.log(`created user ${user.id}`);

  return c.text("sucess");
};
