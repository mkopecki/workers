import { readdir } from "node:fs/promises";
import path from "path";
import { z } from "zod";

const WORKERS_PATH = "workers";

type Worker = {
  id: string;
  name: string;

  worker_dir: string;
  config_path: string;

  entrypoint_path: string;
  config_schema: string;
};

const worker_config = z.object({
  id: z.string(),
  name: z.string(),

  entrypoint_path: z.string(),
  config_schema_path: z.string(),
});

const load_workers = async () => {
  const files = await readdir(WORKERS_PATH, { recursive: true });
  const toml_files = files.filter(x => x.includes("toml"));

  const workers = Promise.all(
    toml_files.map(async toml_file => {
      const config_path = path.join(process.cwd(), WORKERS_PATH, toml_file);
      const config_file = Bun.file(config_path);
      const config_toml = await config_file.text();
      const config = Bun.TOML.parse(config_toml) as typeof worker_config._type;
      worker_config.parse(config);

      const worker_dir = path.dirname(config_path);

      // load config schema
      const config_schema_path = path.join(
        worker_dir,
        config.config_schema_path
      );
      const config_schema_file = Bun.file(config_schema_path);
      const config_schema = await config_schema_file.json();

      // transform to worker
      const worker: Worker = {
        id: config.id,
        name: config.name,
        entrypoint_path: config.entrypoint_path,

        worker_dir,
        config_path,

        config_schema,
      };

      return worker;
    })
  );

  return workers;
};

export const workers = await load_workers();
