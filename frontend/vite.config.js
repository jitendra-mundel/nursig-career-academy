import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    open: true,
  },
  // Improve esbuild target for node_modules and avoid bundling issues
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
  },
  // Prevent Vite SSR bundling from externalizing MUI/emotion which can trigger "use client" directive issues
  ssr: {
    noExternal: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/system',
      '@mui/styled-engine',
      '@emotion/react',
      '@emotion/styled',
    ],
  },
})
