import express from "express";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();

  // Determine runtime mode:
  // - In development (npm run dev / tsx server.ts), Vite middleware is mounted and port 3000 is used for the dev proxy.
  // - In production (npm start / dist/server.cjs / Cloud Run), pre-built static files from dist/ are served,
  //   and the server listens on Cloud Run's injected PORT (default 8080).
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.npm_lifecycle_event === "start" ||
    (typeof __filename !== "undefined" && (__filename.includes("dist") || __filename.endsWith(".cjs")));

  const isDev = !isProduction;

  const PORT = isDev ? 3000 : (Number(process.env.PORT) || 8080);

  app.use(express.json());

  // Health check endpoints for Cloud Run startup/liveness probes & load balancers
  app.get(["/api/health", "/health", "/_health"], (_req, res) => {
    res.status(200).json({
      status: "ok",
      app: "ANTEN Business Manager",
      version: "1.0.0",
      uptime: process.uptime(),
    });
  });

  // Vite development middleware or static production asset serving
  if (isDev) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Determine directory containing dist files
    const cwdDist = path.resolve(process.cwd(), "dist");
    const distPath = fs.existsSync(cwdDist) ? cwdDist : path.resolve(__dirname, ".");
    const indexPath = path.join(distPath, "index.html");

    // Serve compiled static assets
    app.use(express.static(distPath, { index: "index.html" }));

    // SPA fallback: send index.html for any unhandled GET route
    app.get("*", (_req, res) => {
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Application static assets not found. Please build the app.");
      }
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} [mode=${isDev ? "development" : "production"}]`);
  });

  server.on("error", (err: unknown) => {
    console.error("Server fatal error:", err);
    process.exit(1);
  });

  // Graceful shutdown on SIGTERM / SIGINT for Cloud Run container lifecycle
  const handleShutdown = (signal: string) => {
    console.log(`Received ${signal}, closing server gracefully...`);
    server.close(() => {
      console.log("Server stopped successfully.");
      process.exit(0);
    });
    setTimeout(() => {
      console.error("Forced exit due to shutdown timeout.");
      process.exit(1);
    }, 5000).unref();
  };

  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  process.on("SIGINT", () => handleShutdown("SIGINT"));
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
