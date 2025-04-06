import { Hono } from "hono";
import { create_message } from "./threads/create_message";
import { cors } from "hono/cors";
import { get_threads } from "./threads/get_threads";
import { create_thread } from "./threads/create_thread";
import { create_run } from "./threads/create_run";
import { get_thread_data } from "./threads/get_thread_data";
import { get_thread_data_stream } from "./threads/get_thread_data_stream";
import { update_thread } from "./threads/update_thread";
import { make_auth_guard } from "./auth/jwt";
import { create_user } from "./auth/routes/create_user";
import { create_guest_user } from "./auth/routes/create_guest_user";
import { create_user_session } from "./auth/routes/create_user_session";
import { get_user } from "./auth/routes/get_user";
import { get_workers } from "./workers/get_workers";
import { delete_thread } from "./threads/delete_thread";
import { archive_thread } from "./threads/archive_thread";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: [
      "http://client.localhost",
      "http://localhost:5173",
      `https://${process.env.CLIENT_HOST}`,
    ],
    allowMethods: ["GET", "POST", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.use("/api/*", make_auth_guard());

// app routes
app.get("/api/thread", get_threads);

app.post("/api/thread", create_thread);
app.post("/api/run", create_run);
app.post("/api/thread/:id/message", create_message);
app.get("/api/thread/:id", get_thread_data);
app.get("/api/thread/:id/stream", get_thread_data_stream);

app.post("/api/thread/:id", update_thread);

app.post("/api/thread/:id/delete", delete_thread);
app.post("/api/thread/:id/archive", archive_thread);

app.get("/api/worker", get_workers);

// auth routes
app.get("/api/user", get_user);
app.post("/auth/user", create_user);
// app.post("/auth/user/guest", create_guest_user);
app.post("/auth/user/session", create_user_session);

app.get("/ping", c => c.text("pong"));

export default app;
