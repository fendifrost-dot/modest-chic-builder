import { handleRequest } from "./api.mjs";
import { loadLocalEnv } from "./env.mjs";

loadLocalEnv();

function mount(middlewares) {
  middlewares.use((req, res, next) => {
    handleRequest(req, res)
      .then((handled) => {
        if (!handled) next();
      })
      .catch((error) => {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: error.message || "Server error" }));
      });
  });
}

export function modestApi() {
  return {
    name: "modest-api",
    configureServer(server) {
      mount(server.middlewares);
    },
    configurePreviewServer(server) {
      mount(server.middlewares);
    },
  };
}
