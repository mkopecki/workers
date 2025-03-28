import { db } from "@src/db/db";
import { users_table } from "@src/db/schema";
import type { H } from "hono/types";
import { z } from "zod";
import { eq } from "drizzle-orm";
import cuid from "cuid";
import { genSalt, hash } from "bcrypt";
import { permissions, Permission } from "../permissions";
import type { JWTPayload } from "../jwt";
import { sign } from "hono/jwt";
import { setCookie } from "hono/cookie";
import { balance } from "@src/balance";

const CreateUserPayload = z.object({
  email: z.string(),
  password: z.string(),
});

const DEFAULT_USER_PERMISSIONS: Permission[] = [
  permissions.is_registered,
  permissions.can_access_model("openai_gpt_4o_mini"),
  permissions.can_access_model("openai_gpt_4o"),
];

const DEFAULT_USER_BALANCE = 50;

export const create_user: H = async c => {
  // validate data
  const data = await c.req.json<z.infer<typeof CreateUserPayload>>();
  CreateUserPayload.parse(data);
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
    permissions: permissions.get_ids(DEFAULT_USER_PERMISSIONS),
  };
  await db.insert(users_table).values(user);
  console.log(`created user ${user.id}`);

  // grant initial credits
  await balance.modify(user.id, DEFAULT_USER_BALANCE);

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
