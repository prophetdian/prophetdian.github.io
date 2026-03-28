import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handlePayPalWebhook, handleBankTransferWebhook, verifyPayPalSignature, verifyBankTransferSignature } from "../webhooks";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Webhook routes
  app.post("/api/webhooks/paypal", express.json(), async (req, res) => {
    try {
      const transmissionId = req.headers["paypal-transmission-id"] as string;
      const transmissionTime = req.headers["paypal-transmission-time"] as string;
      const certUrl = req.headers["paypal-cert-url"] as string;
      const actualSignature = req.headers["paypal-auth-algo"] as string;
      const webhookId = process.env.PAYPAL_WEBHOOK_ID || "";

      // Verify signature (implement proper verification in production)
      if (!verifyPayPalSignature(transmissionId, transmissionTime, certUrl, actualSignature, JSON.stringify(req.body), webhookId)) {
        return res.status(401).json({ error: "Invalid signature" });
      }

      const result = await handlePayPalWebhook(req.body);
      res.status(200).json(result);
    } catch (error) {
      console.error("[PayPal Webhook] Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/webhooks/bank-transfer", express.json(), async (req, res) => {
    try {
      const signature = req.headers["x-signature"] as string;
      const secret = process.env.BANK_TRANSFER_WEBHOOK_SECRET || "";

      // Verify signature (implement proper verification in production)
      if (!verifyBankTransferSignature(signature, JSON.stringify(req.body), secret)) {
        return res.status(401).json({ error: "Invalid signature" });
      }

      const result = await handleBankTransferWebhook(req.body);
      res.status(200).json(result);
    } catch (error) {
      console.error("[Bank Transfer Webhook] Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
