import * as path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    server: {
      sourcemap: "inline",
    },
    fileParallelism: true,
    name: "Pingu",
    typecheck: {
      enabled: true,
      checker: "vue-tsc",
      ignoreSourceErrors: true,
      tsconfig: path.resolve(__dirname, "./tsconfig.json"),
    },
    coverage: {
      all: false,
      clean: true,
      provider: "v8",
      cleanOnRerun: true,
      reportOnFailure: true,
      include: ["**/src/**"],
      reporter: ["clover", "json", "html", "html-spa"],
      reportsDirectory: path.resolve(__dirname, "./coverage"),
    },
    dir: path.resolve(__dirname, "./tests"),
    cache: false,
    globals: true,
    pool: "forks",
    poolOptions: {
      threads: {
        singleThread: true,
      },
      forks: {
        singleFork: true,
      },
    },
  },
});
