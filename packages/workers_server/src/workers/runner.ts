import { db } from "@src/db";
import { runs_table } from "@src/db/schema";
import { eq } from "drizzle-orm";
import { workers } from "./workers";
import type { Worker } from "./workers";
import path from "path";
import type { Run } from "@src/types";
import type { Subprocess } from "bun";

const RUN_BATCH_SIZE = 1;
const ITER_SLEEP_TIME = 1000;

const start = async () => {
  while (true) {
    const queued_runs = await db
      .select()
      .from(runs_table)
      .where(eq(runs_table.status, "queued"))
      .limit(RUN_BATCH_SIZE);

    if (queued_runs.length !== 0) {
      for (const run of queued_runs) {
        void run_worker(run);
      }
    }

    await Bun.sleep(ITER_SLEEP_TIME);
  }
};

const spawn_proc = (worker: Worker, run: Run): Subprocess => {
  const entrypoint = path.join(worker.worker_dir, worker.entrypoint_path);

  console.log("spawning worker");

  switch (worker.type) {
    case "bun": {
      const proc = Bun.spawn(["bun", entrypoint, run.id], {
        stdout: "inherit",
        stderr: "inherit",
      });
      return proc;
    }

    case "python": {
      const proc = Bun.spawn(["bun", entrypoint, run.id], {
        stdout: "inherit",
        stderr: "inherit",
      });
      return proc;
    }
  }
};

const run_worker = async (run: Run) => {
  await db
    .update(runs_table)
    .set({ status: "processing" })
    .where(eq(runs_table.id, run.id));

  try {
    const worker = workers.find(x => x.id === run.worker_id);
    if (!worker) throw new Error("worker not found");

    const proc = spawn_proc(worker, run);

    const exit_code = await proc.exited;

    if (exit_code === 0) {
      await db
        .update(runs_table)
        .set({ status: "success" })
        .where(eq(runs_table.id, run.id));
    } else {
      throw new Error("worker execution failed");
    }
  } catch (e) {
    await db
      .update(runs_table)
      .set({ status: "error" })
      .where(eq(runs_table.id, run.id));
  }
};

export const runner = {
  start,
};
