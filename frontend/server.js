const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { createProxyMiddleware } = require("http-proxy-middleware");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

  console.log("==========================================");
  console.log("🚀 Server Configuration");
  console.log("==========================================");
  console.log(`Environment: ${dev ? "development" : "production"}`);
  console.log(`Backend URL: ${backendUrl}`);
  console.log(`BACKEND_URL env var: ${process.env.BACKEND_URL || "NOT SET (using default)"}`);
  console.log("==========================================\n");

  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;

      // Proxy WebSocket connections to backend
      if (pathname === "/api/ws") {
        // This will be handled by the WebSocket proxy middleware below
        return;
      }

      // Handle all other requests with Next.js
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("❌ Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // WebSocket proxy middleware
  const wsProxy = createProxyMiddleware({
    target: backendUrl,
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      "^/api/ws": "/api/ws",
    },
    logLevel: dev ? "debug" : "info",
    onProxyReqWs: (proxyReq, req, socket, options, head) => {
      const fullUrl = `${backendUrl}${req.url}`;
      console.log(`🔌 WebSocket PROXY REQUEST: ${req.url}`);
      console.log(`   → Target: ${fullUrl}`);
    },
    onOpen: (proxySocket) => {
      console.log("✅ WebSocket connection OPENED to backend");
    },
    onClose: (res, socket, head) => {
      console.log("🔌 WebSocket connection CLOSED");
    },
    onError: (err, req, socket) => {
      console.error("❌ WebSocket PROXY ERROR:");
      console.error(`   URL: ${req.url}`);
      console.error(`   Target: ${backendUrl}`);
      console.error(`   Error: ${err.message}`);
    },
  });

  // Apply WebSocket proxy to the server
  server.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url, true);

    console.log(`🔄 WebSocket UPGRADE request received: ${req.url}`);

    if (pathname === "/api/ws") {
      console.log(`   ✅ Proxying to backend: ${backendUrl}${req.url}`);
      wsProxy.upgrade(req, socket, head);
    } else {
      console.log(`   ❌ Invalid WebSocket path, destroying socket`);
      socket.destroy();
    }
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`\n✅ Ready on http://${hostname}:${port}`);
    console.log(`📡 WebSocket endpoint: ws://${hostname}:${port}/api/ws\n`);
  });
});
