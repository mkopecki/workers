import { Hono } from "hono";
import { create_message } from "./routes/create_message";
import { get_messages } from "./routes/get_messages";
import { cors } from "hono/cors";
import { get_threads } from "./routes/get_threads";
import { create_thread } from "./routes/create_thread";
import { create_run } from "./routes/create_run";
import { get_thread } from "./routes/get_thread";
import { get_thread_runs } from "./routes/get_thread_runs";
import { get_run } from "./routes/get_run";
import { get_run_steps } from "./routes/get_run_steps";
import { get_thread_data } from "./routes/get_thread_data";
import { get_thread_data_stream } from "./routes/get_thread_data_stream";

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: "*",
    allowMethods: ["GET"],
    allowHeaders: ["Content-Type"],
  })
);

app.get("/api/thread", get_threads);
app.post("/api/thread", create_thread);

app.post("/api/run", create_run);

app.post("/api/thread/:id/message", create_message);

app.get("/api/thread/:id", get_thread_data);
app.get("/api/thread/:id/stream", get_thread_data_stream);

export default app;
