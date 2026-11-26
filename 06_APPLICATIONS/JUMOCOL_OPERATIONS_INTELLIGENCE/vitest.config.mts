import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "src"),
      "server-only": path.resolve(projectRoot, "src/test/server-only.ts"),
      "@motor/tiviplay-monthly-close-v1/core": path.resolve(projectRoot, "../../05_AUTOMATION/tiviplay-monthly-close-v1/src/core.mjs"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
