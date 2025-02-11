import { Hono } from "hono";
import { create_message } from "./routes/create_message";
import { cors } from "hono/cors";
import { get_threads } from "./routes/get_threads";
import { create_thread } from "./routes/create_thread";
import { create_run } from "./routes/create_run";
import { get_thread_data } from "./routes/get_thread_data";
import { get_thread_data_stream } from "./routes/get_thread_data_stream";
import { verify } from "hono/jwt";
import { create_guest_session } from "./routes/auth/create_guest_session";
import { getCookie } from "hono/cookie";
import { signup_user } from "./routes/auth/signup_user";
import { signin_user } from "./routes/auth/signin_user";
import { me_user } from "./routes/me_user";
import { update_thread } from "./routes/update_thread";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: "http://localhost:5173",
    allowMethods: ["GET", "POST", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.use("/api/*", async (_, next) => {
  try {
    const token = getCookie(_, "auth_token");
    const jwt_secret = process.env.JWT_SECRET!;

    if (!token) {
      console.log("no token present");
      return _.json({ message: "Unauthorized" }, 401);
    }

    const jwt_payload = await verify(token, jwt_secret);

    if (!jwt_payload) {
      console.log("token expired");
      return _.json({ message: "token expired" }, 401);
    }

    _.set("jwtPayload", jwt_payload);
    await next();
  } catch (error) {
    console.error(error);
    return _.json({ message: "Unauthorized" }, 401);
  }
});

// app routes
app.get("/api/thread", get_threads);
app.post("/api/thread", create_thread);
app.post("/api/run", create_run);
app.post("/api/thread/:id/message", create_message);
app.get("/api/thread/:id", get_thread_data);
app.get("/api/thread/:id/stream", get_thread_data_stream);

app.post("/api/thread/:id", update_thread);

// user routes
app.get("/api/me", me_user);

// auth routes
app.post("/auth/user/signup", signup_user);
app.post("/auth/user/signin", signin_user);
app.post("/auth/guest/session", create_guest_session);


export default app;
