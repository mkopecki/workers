import { db } from "@src/db";
import { users_table } from "@src/db/schema";
import type { H } from "hono/types";
import { z } from "zod";
import { eq, or } from "drizzle-orm";
import cuid from "cuid";
import { genSalt, hash } from "bcrypt";
import { sign } from "hono/jwt";
import { setCookie } from "hono/cookie";
import type { JWTPayload } from "@src/auth/jwt";

const create_user_data = z.object({
  username: z.string(),
  email: z.string(),
  password: z.string(),
});

export const create_user: H = async c => {
  // validate data
  const data = await c.req.json<z.infer<typeof create_user_data>>();
  create_user_data.parse(data);
  const { email, password, username } = data;

  // check if user already exists
  const existing_users = await db
    .select()
    .from(users_table)
    .where(
      or(eq(users_table.email, email), eq(users_table.username, username))
    );

  if (existing_users.length !== 0) {
    throw new Error("user already exists");
  }

  // create user record
  const salt = await genSalt(10);
  const hashed_password = await hash(password, salt);

  const user: typeof users_table.$inferInsert = {
    id: cuid(),
    username,
    email,
    hashed_password,
  };
  await db.insert(users_table).values(user);
  console.log(`created user ${user.id}`);

  // create JWT cookie
  const jwt_secret = process.env.JWT_SECRET!;
  const jwt_payload: JWTPayload = {
    id: user.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 20,
  };
  const token = await sign(jwt_payload, jwt_secret);

  setCookie(c, "workers_auth_token", token, {
    secure: true,
    httpOnly: true,
  });

  return c.json({
    data: jwt_payload,
    token: token,
  });
};
