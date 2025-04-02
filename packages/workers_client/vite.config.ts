import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "micromark-extension-math": "micromark-extension-llm-math",
      },
    },
    define: {
      __SERVER_HOST__: JSON.stringify(env.VITE_SERVER_HOST),
    },
  };
});
