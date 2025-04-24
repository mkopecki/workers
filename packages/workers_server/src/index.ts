import { Hono } from "hono";
import { cors } from "hono/cors";
import { make_auth_guard } from "./auth/jwt";
import { worker_routes } from "./workers/routes";
import { runner } from "./workers/runner";
import { client_routes } from "./client/routes";
import { create_message_stream } from "./workers/routes/create_message_stream";

const runner_promise = runner.start();

const app = new Hono();

const origin = [
  "http://client.localhost",
  "http://localhost:5173",
  `https://${process.env.CLIENT_HOST}`,
];
console.log(process.env);
console.log(origin);

app.use(
  "/*",
  cors({
    origin,
    allowMethods: ["GET", "POST", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type"],
    credentials: true,
  })
);

// worker routes
app.get("/worker/run/:id", worker_routes.get_run);
app.post("/worker/run/:id/step", worker_routes.create_run_step);
app.get("/worker/thread/:id/state/:thread_state_id", worker_routes.get_thread);
app.post("/worker/thread/:thread_id/message", worker_routes.create_message);
app.post(
  "/worker/thread/:thread_id/message/chunk",
  worker_routes.create_message_chunk
);
app.post(
  "/worker/thread/:thread_id/:thread_state_id/message/:message_id/stream",
  create_message_stream
);

// client routes
app.use("/api/*", make_auth_guard());

app.get("/api/thread", client_routes.threads.get_threads);
app.post("/api/thread/:id/delete", client_routes.threads.delete_thread);
app.post("/api/thread/:id/archive", client_routes.threads.archive_thread);
app.post("/api/thread", client_routes.threads.create_thread);
app.get("/api/thread/:id", client_routes.threads.get_thread);
app.get(
  "/api/thread/:id/stream",
  client_routes.threads.get_thread_event_stream
);
app.post("/api/thread/:id/message", client_routes.threads.create_message);
app.post("/api/thread/:id", client_routes.threads.update_thread);

app.get("/api/worker", client_routes.workers.get_workers);
app.post("/api/run", client_routes.runs.create_run);

// auth routes
app.get("/api/user", client_routes.auth.get_user);
app.post("/auth/user", client_routes.auth.create_user);
app.post("/auth/user/session", client_routes.auth.create_user_session);

app.get("/ping", c => c.text("pong"));

export default app;
