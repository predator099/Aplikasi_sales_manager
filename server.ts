import express from "express";
import path from "path";
import fs from "fs";
import cookieParser from "cookie-parser";
import { apiRouter } from "./src/server/api";

async function startServer() {
  const app = express();
  // PORT is strictly 3000 as required by the reverse proxy architecture (port 8080 is reserved for nginx)
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));
  app.use(cookieParser());

  // Health check endpoints for probes and monitoring
  app.get(["/api/health", "/health", "/_health"], (_req, res) => {
    res.status(200).json({ status: "ok", app: "ANTEN Business Manager" });
  });

  // Mount production API routes
  app.use("/api", apiRouter);

  // Vite middleware for development vs static files for production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Application static assets not found. Please build the app.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
