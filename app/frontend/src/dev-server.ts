import { serve } from "bun";
import index from "./index.html";

const API_TARGET = "http://localhost:3002";

const server = serve({
  routes: {
    "/*": index,
    "/api/*": (req) => {
      const url = new URL(req.url);
      const targetUrl = new URL(url.pathname + url.search, API_TARGET);

      return fetch(new Request(targetUrl, req));
    },
  },

  development: {
    hmr: true,
    console: true,
  },
});

console.log(`H3 dev server running at ${server.url}`);
