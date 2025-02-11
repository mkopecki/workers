import { db } from "@src/db/db";
import { sessions_table, users_table } from "@src/db/schema";
import cuid from "cuid";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import type { H } from "hono/types";

export type JWTPayload = {
  id: string;
  exp: number;
}

export const create_guest_session: H = async c => {
  // create session in the database
  const user: typeof users_table.$inferInsert = {
    id: cuid(),
    type: "guest",
    guest_id: cuid(),
  };
  await db.insert(users_table).values(user);

  // create user in the databas
  const session: typeof sessions_table.$inferInsert = {
    id: cuid(),
    user_id: user.id,
  };
  await db.insert(sessions_table).values(session);

  // create JWT cookie
  const jwt_secret = process.env.JWT_SECRET!;
  const jwt_payload: JWTPayload = {
    id: user.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 20,
  };
  const token = await sign(jwt_payload, jwt_secret);

  setCookie(c, "auth_token", token, {
    secure: true,
    httpOnly: true,
  });

  return c.json({
    data: jwt_payload,
    token: token,
  });
};
