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
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // WebSocket proxy middleware
  const wsProxy = createProxyMiddleware({
    target: process.env.BACKEND_URL || "http://localhost:8000",
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      "^/api/ws": "/api/ws",
    },
    logLevel: dev ? "debug" : "error",
  });

  // Apply WebSocket proxy to the server
  server.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url, true);

    if (pathname === "/api/ws") {
      wsProxy.upgrade(req, socket, head);
    } else {
      socket.destroy();
    }
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
