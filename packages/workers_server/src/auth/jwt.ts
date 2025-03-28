import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import type { Permission } from "./permissions";
import { verify } from "hono/jwt";

export type JWTPayload = {
  id: string;
  exp: number;
};

export const make_auth_guard =
  (required_permissions?: Permission[]) => async (c: Context, next: Next) => {
    try {
      const token = getCookie(c, "workers_auth_token");
      const jwt_secret = process.env.JWT_SECRET!;

      if (!token) {
        console.log("no token present");
        return c.json({ message: "Unauthorized" }, 401);
      }

      const jwt_payload = await verify(token, jwt_secret);

      if (!jwt_payload) {
        console.log("token expired");
        return c.json({ message: "token expired" }, 401);
      }

      c.set("jwtPayload", jwt_payload);
      await next();
    } catch (error) {
      console.error(error);
      return c.json({ message: "Unauthorized" }, 401);
    }
  };
