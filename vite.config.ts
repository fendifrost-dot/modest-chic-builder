/// <reference types="vitest" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
function prioritizeLcp() {
  return {
    name: "prioritize-lcp",
    apply: "build",
    transformIndexHtml(html) {
      let scriptSrc = "";
      html = html.replace(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/, (_, src) => {
        scriptSrc = src;
        return "";
      });
      html = html.replace(/<link rel="modulepreload"[^>]*>/g, "");
      html = html.replace(/<link rel="stylesheet"([^>]*?)>/g, (tag) => {
        if (tag.includes("media=") || tag.includes("onload=")) return tag;
        const href = tag.match(/href="([^"]+)"/)?.[1];
        if (!href || !href.includes("/assets/")) return tag;
        return `<link rel="preload" as="style" href="${href}"><link rel="stylesheet" href="${href}" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="${href}"></noscript>`;
      });
      if (!scriptSrc) return html;
      // Start the module only after #lcp-hero has painted. A script that evaluates
      // before that paint is treated as an LCP dependency, and the 370KB bundle
      // then dominates the simulated score even though the hero is static HTML.
      const loader = `<script>(function(){var started=false;function start(){if(started)return;started=true;var s=document.createElement("script");s.type="module";s.src=${JSON.stringify(scriptSrc)};document.body.appendChild(s);}function afterPaint(){requestAnimationFrame(function(){requestAnimationFrame(start);});}var img=document.getElementById("lcp-hero");if(img&&!(img.complete&&img.naturalWidth)){img.addEventListener("load",afterPaint,{once:true});img.addEventListener("error",afterPaint,{once:true});}else{afterPaint();}setTimeout(start,1500);})();</script>`;
      return html.replace("</body>", `${loader}</body>`);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), "");
  for (const [key, value] of Object.entries(fileEnv)) {
    if (process.env[key] == null || process.env[key] === "") process.env[key] = value;
  }
  return {
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger(), prioritizeLcp()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
};
});