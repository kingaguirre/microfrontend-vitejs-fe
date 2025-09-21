import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Pages from 'vite-plugin-pages'
import federation from '@originjs/vite-plugin-federation'
import path from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import moduleConfig from './src/module.config.json'

export default defineConfig({
  root: '.',
  plugins: [
    react(),
    Pages({ pagesDir: 'src/pages', importMode: 'async' }),
    federation({
      name: moduleConfig.moduleName,
      filename: 'remoteEntry.js',
      exposes: { './Routes': './src/routes.tsx' },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
        'react-router-dom': { singleton: true, requiredVersion: '^7.6.2' },
        '@tanstack/react-query': { singleton: true },
        '@app/common': { singleton: true, strictVersion: true, requiredVersion: false }
      }
    })
  ],
  resolve: {
    alias: {
      // Monorepo aliases
      '@app/app-shell': path.resolve(__dirname, '../app-shell/src'),
      // Module-specific aliases
      '@components': path.resolve(__dirname, 'src/components')
    }
  },
  css: {
    postcss: { plugins: [tailwindcss(), autoprefixer()] }
  },
  server: {
    port: 3002,
    fs: { strict: true }
    // Vite does SPA fallback by default, no extra config needed
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',

    // ---- add this: ----
    coverage: {
      reporter: ['text', 'lcov', 'html'], // lcov for Sonar, html for local, text summary
      reportsDirectory: './coverage',
      exclude: [
        'src/components/demo/**', // ignore your demo-only components
        'src/pages/demo/**',
        '**/*.test.*', // don’t count tests themselves
        'src/module.config.json'
      ]
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js'
      }
    }
  }
})
