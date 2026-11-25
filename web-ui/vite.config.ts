import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";
import { fileURLToPath } from "node:url";

// KaTeX 的 @font-face 同时列出 woff2 / woff / ttf，浏览器只会用第一个支持的 woff2，
// 去掉后两者的引用，避免把用不到的字体文件打进 APK
function katexWoff2Only(): Plugin {
  return {
    name: "katex-woff2-only",
    enforce: "pre",
    transform(code, id) {
      if (!/katex(\.min)?\.css($|\?)/.test(id)) return null;
      return code.replace(/,\s*url\([^)]*\.(?:woff|ttf)\)\s*format\("(?:woff|truetype)"\)/g, "");
    },
  };
}

export default defineConfig({
  plugins: [katexWoff2Only(), tailwindcss(), reactRouter(), tsconfigPaths(), svgr()],
  // tsconfig path discovery can miss the project when pnpm is loaded via a
  // Windows substituted drive and Vite canonicalizes imports to the real path.
  resolve: { alias: { "~": fileURLToPath(new URL("./app", import.meta.url)) } },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
