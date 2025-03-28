import { db } from "@src/db/db";
import { sessions_table, users_table } from "@src/db/schema";
import cuid from "cuid";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import type { H } from "hono/types";
import type { JWTPayload } from "../jwt";
import { permissions } from "../permissions";
import { balance } from "@src/balance";

const GUEST_DEFAULT_PERMISSIONS = [
  permissions.can_access_model("openai_gpt_4o_mini"),
];

const DEFAULT_GUEST_BALANCE = 10;

export const create_guest_user: H = async c => {
  // create session in the database
  const user: typeof users_table.$inferInsert = {
    id: cuid(),
    type: "guest",
    guest_id: cuid(),
    permissions: permissions.get_ids(GUEST_DEFAULT_PERMISSIONS),
  };
  await db.insert(users_table).values(user);

  await balance.modify(user.id, DEFAULT_GUEST_BALANCE);

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

  setCookie(c, "workers_auth_token", token, {
    secure: true,
    httpOnly: true,
  });

  return c.json({
    data: jwt_payload,
    token: token,
  });
};
