const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { createProxyMiddleware } = require("http-proxy-middleware");
const httpProxy = require("http-proxy");

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

  // Create WebSocket proxy using http-proxy directly
  const wsProxy = httpProxy.createProxyServer({
    target: backendUrl,
    ws: true,
    changeOrigin: true,
  });

  // Handle proxy errors
  wsProxy.on("error", (err, req, socket) => {
    console.error("❌ WebSocket PROXY ERROR:");
    console.error(`   URL: ${req?.url || 'unknown'}`);
    console.error(`   Target: ${backendUrl}`);
    console.error(`   Error message: ${err.message}`);
    console.error(`   Error code: ${err.code}`);
    console.error(`   Error stack:`, err.stack);

    // Send error response to client
    if (socket && socket.writable) {
      socket.write('HTTP/1.1 502 Bad Gateway\r\n\r\n');
      socket.end();
    }
  });

  // Handle successful proxy connections
  wsProxy.on("open", (proxySocket) => {
    console.log("✅ WebSocket connection OPENED to backend");
    proxySocket.on("error", (err) => {
      console.error("❌ Proxy socket error:", err.message);
    });
  });

  wsProxy.on("close", (res, socket, head) => {
    console.log("🔌 WebSocket proxy connection CLOSED");
  });

  wsProxy.on("proxyReqWs", (proxyReq, req, socket, options, head) => {
    console.log(`🔌 WebSocket PROXY REQUEST: ${req.url}`);
    console.log(`   → Target: ${backendUrl}${req.url}`);
    console.log(`   → Headers:`, JSON.stringify(proxyReq.getHeaders ? proxyReq.getHeaders() : {}, null, 2));
  });

  // Apply WebSocket proxy to the server
  server.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url, true);

    console.log(`🔄 WebSocket UPGRADE request received: ${req.url}`);
    console.log(`   Path: ${pathname}`);
    console.log(`   Headers:`, JSON.stringify(req.headers, null, 2));

    if (pathname === "/api/ws") {
      console.log(`   ✅ Proxying to backend: ${backendUrl}${req.url}`);

      // Add error handler for the socket
      socket.on("error", (err) => {
        console.error("❌ Socket error during upgrade:", err.message);
        console.error("   Stack:", err.stack);
      });

      try {
        // Use ws() method for WebSocket proxy
        wsProxy.ws(req, socket, head);
        console.log("   📤 WebSocket proxy initiated");
      } catch (err) {
        console.error("❌ Exception during wsProxy.ws():");
        console.error(`   Error: ${err.message}`);
        console.error(`   Stack: ${err.stack}`);
        socket.destroy();
      }
    } else {
      console.log(`   ❌ Invalid WebSocket path: ${pathname}, destroying socket`);
      socket.destroy();
    }
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`\n✅ Ready on http://${hostname}:${port}`);
    console.log(`📡 WebSocket endpoint: ws://${hostname}:${port}/api/ws\n`);
  });
});
