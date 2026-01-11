const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { createProxyMiddleware } = require("http-proxy-middleware");

const dev = process.env.NODE_ENV !== "production";
const hostname = dev ? "localhost" : "0.0.0.0";
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

      // Health check endpoint to test backend connectivity
      if (pathname === "/api/health-check") {
        console.log("🏥 Health check endpoint called");
        try {
          const testResponse = await fetch(`${backendUrl}/docs`);
          console.log(`   ✅ Backend reachable: ${testResponse.status}`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            status: "ok",
            backendUrl,
            backendReachable: testResponse.ok,
            backendStatus: testResponse.status
          }));
        } catch (err) {
          console.error(`   ❌ Backend NOT reachable: ${err.message}`);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            status: "error",
            backendUrl,
            backendReachable: false,
            error: err.message
          }));
        }
        return;
      }

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
    logLevel: dev ? "debug" : "info",
    onProxyReqWs: (proxyReq, req, socket, options, head) => {
      console.log(`🔌 WebSocket PROXY REQUEST: ${req.url}`);
      console.log(`   → Target: ${backendUrl}${req.url}`);
    },
    onOpen: (proxySocket) => {
      console.log("✅ WebSocket connection OPENED to backend");
      proxySocket.on("error", (err) => {
        console.error("❌ Proxy socket error:", err.message);
      });
    },
    onClose: (res, socket, head) => {
      console.log("🔌 WebSocket connection CLOSED");
    },
    onError: (err, req, socket) => {
      console.error("❌ WebSocket PROXY ERROR:");
      console.error(`   URL: ${req?.url || 'unknown'}`);
      console.error(`   Target: ${backendUrl}`);
      console.error(`   Error message: ${err.message}`);
      console.error(`   Error code: ${err.code}`);

      // Send error response to client
      if (socket && socket.writable) {
        socket.end();
      }
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
