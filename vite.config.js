import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      buffer: "buffer",
      process: "process/browser",
      util: "util",
      stream: "stream-browserify",
      crypto: "crypto-browserify",
      assert: "assert"
    }
  },
  optimizeDeps: {
    include: ["buffer", "process"]
  },
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()]
    }
  },
  define: {
    global: "globalThis"
  }
})
