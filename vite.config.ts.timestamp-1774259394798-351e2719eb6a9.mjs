// vite.config.ts
import { defineConfig } from "file:///D:/hazik/Documents/Kaem%20Kaar/kaem-kaar/node_modules/vite/dist/node/index.js";
import react from "file:///D:/hazik/Documents/Kaem%20Kaar/kaem-kaar/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///D:/hazik/Documents/Kaem%20Kaar/kaem-kaar/node_modules/lovable-tagger/dist/index.js";
import tailwindcss from "file:///D:/hazik/Documents/Kaem%20Kaar/kaem-kaar/node_modules/@tailwindcss/vite/dist/index.mjs";
var __vite_injected_original_dirname =
  "D:\\hazik\\Documents\\Kaem Kaar\\kaem-kaar";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    tailwindcss(),
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
    },
  },
}));
export { vite_config_default as default };
