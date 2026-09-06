import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parser for waitlist (we must mount this before proxy, but wait, proxy is on /api/gemini only)
  app.use(express.json());

  app.post('/api/waitlist', (req, res) => {
      const { name, email } = req.body;
      if (name && email) {
          fs.appendFileSync(path.join(process.cwd(), 'waitlist.txt'), `${new Date().toISOString()} - ${name} - ${email}\n`);
      }
      res.json({ success: true });
  });

  const geminiProxy = createProxyMiddleware({
      target: 'https://generativelanguage.googleapis.com',
      changeOrigin: true,
      ws: true, // proxy websockets!
      pathRewrite: {
          '^/api/gemini': ''
      },
      on: {
          proxyReq: (proxyReq, req, res) => {
              // Inject API key in header for REST
              proxyReq.setHeader('x-goog-api-key', process.env.GEMINI_API_KEY || '');
          },
          proxyReqWs: (proxyReq, req, socket, options, head) => {
              // Inject API key into path for WS since headers might be dropped by the SDK
              // proxyReq is a ClientRequest
              const key = process.env.GEMINI_API_KEY || '';
              proxyReq.path = proxyReq.path + (proxyReq.path.includes('?') ? '&' : '?') + 'key=' + key;
          }
      }
  });

  app.use('/api/gemini', geminiProxy);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Use the built-in HTTP server from Express to handle WS upgrades
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  
  // Need to manually handle upgrade for the proxy
  server.on('upgrade', geminiProxy.upgrade);
}

startServer();
