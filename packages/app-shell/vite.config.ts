import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import path from "path";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig(({ mode }) => {
  // 1. load your local .env.* files (mostly for local dev)
  const envLocal = loadEnv(mode, process.cwd(), "VITE_");
  // 2. overlay any real environment variables (including Vercel’s)
  const env = {
    ...envLocal,
    ...process.env,
  };

  return {
    root: ".", // looks for index.html here
    plugins: [
      react(),
      federation({
        name: "app_shell",
        remotes: {
          /* __MODULE_txnworkdesk_START */
          txnworkdesk:
            env.VITE_REMOTE_TXNWORKDESK ||
            "http://localhost:4006/assets/remoteEntry.js",
          /* __MODULE_txnworkdesk_END */
          /* __MODULE_ackworkdesk_START */
          ackworkdesk:
            env.VITE_REMOTE_ACKWORKDESK ||
            "http://localhost:4005/assets/remoteEntry.js",
          /* __MODULE_ackworkdesk_END */
          /* __MODULE_setup_START */
          setup:
            env.VITE_REMOTE_SETUP ||
            "http://localhost:4004/assets/remoteEntry.js",
          /* __MODULE_setup_END */
          toolkit:
            env.VITE_REMOTE_TOOLKIT ||
            "http://localhost:4001/assets/remoteEntry.js",
          query:
            env.VITE_REMOTE_QUERY ||
            "http://localhost:4002/assets/remoteEntry.js",
        },
        shared: {
          react: { singleton: true, requiredVersion: "^19.0.0" },
          "react-dom": { singleton: true, requiredVersion: "^19.0.0" },
          "react-router-dom": { singleton: true, requiredVersion: "^7.6.2" },
          "@tanstack/react-query": { singleton: true },
          "@app/common": {
            singleton: true,
            strictVersion: true,
            requiredVersion: false,
          },
        },
      }),
    ],
    resolve: {
      alias: {
        "app-shell": path.resolve(__dirname, "./src"),
      },
    },
    css: {
      postcss: { plugins: [tailwindcss(), autoprefixer()] },
    },
    server: { port: 3000 },
    optimizeDeps: {
      esbuildOptions: {
        target: "esnext",
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./vitest.setup.ts",

      // ---- add this: ----
      coverage: {
        reporter: ["text", "lcov", "html"], // lcov for Sonar, html for local, text summary
        reportsDirectory: "./coverage",
        exclude: [
          "src/components/**", // ignore your demo-only components
          "src/main.tsx", // don’t count the main entry point
          "**/*.test.*", // don’t count tests themselves
          "src/module.config.json",
        ],
      },
    },
    build: {
      target: "esnext",
      outDir: "dist",
      rollupOptions: {
        output: {
          entryFileNames: "assets/[name].js",
          chunkFileNames: "assets/[name].js",
        },
      },
    },
  };
});
