import { defineConfig } from 'vite';

export default defineConfig({
  // 相对路径基座，保证部署到 Pages 子路径时资源可用
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  server: {
    port: 5173,
    host: true,
  },
});
