import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  base: './',
  define: {'process.env.NODE_ENV': JSON.stringify('production')},
  publicDir: false,
  build: {lib: {entry: 'src/main.jsx', formats: ['es'], fileName: () => 'studio.js', cssFileName: 'studio'},
    rollupOptions: {output: {inlineDynamicImports: true}}, sourcemap: false},
});
