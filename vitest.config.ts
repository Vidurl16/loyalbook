import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    // Money/auth paths hit the real dev DB serially — no parallel writes racing the fixtures.
    fileParallelism: false,
    testTimeout: 20_000,
    setupFiles: ["dotenv/config"],
  },
});
