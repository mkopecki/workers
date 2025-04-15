import { db } from "@src/db";
import { users_table } from "@src/db/schema";
import type { H } from "hono/types";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { compare } from "bcrypt";
import { sign } from "hono/jwt";
import { setCookie } from "hono/cookie";
import type { JWTPayload } from "@src/auth/jwt";

const create_user_session_data = z.object({
  email: z.string(),
  password: z.string(),
});

export const create_user_session: H = async c => {
  // validate data
  const data = await c.req.json<z.infer<typeof create_user_session_data>>();
  create_user_session_data.parse(data);
  const { email, password } = data;

  // check if user already exists
  const users = await db
    .select()
    .from(users_table)
    .where(eq(users_table.email, email));

  if (users.length === 0) {
    throw new Error("user does not exist");
  }
  const [user] = users;

  // verify password
  const is_match = await compare(password, user.hashed_password!);
  if (!is_match) {
    throw new Error("password does not match");
  }

  // generate access token
  const jwt_secret = process.env.JWT_SECRET as string;
  const jwt_payload: JWTPayload = {
    id: user.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
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
