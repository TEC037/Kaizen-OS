import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: {
    // El chunk exerciseDatabaseService (dataset de 1,324 ejercicios, 1.7 MB JSON)
    // se carga bajo demanda con React.lazy; aumenta el límite para ese caso legítimo.
    chunkSizeWarningLimit: 1800,
    rollupOptions: {
      output: {
        // Vendors estables en chunks propios: entry más pequeño y caché HTTP inmutable
        // en paralelo con las vistas lazy (@supabase se descarga sólo si está habilitado).
        manualChunks(id) {
          if (id.includes('/node_modules/react-dom/') || id.includes('/node_modules/react/')) {
            return 'react-vendor';
          }
          if (id.includes('/node_modules/@supabase/')) {
            return 'supabase';
          }
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Reutiliza una instancia de jsdom por worker (vitest reduce la creación
    // de 13+ entornos por suite a 1, ahorrando ~40 s de overhead).
    pool: 'vmThreads',
  },
});
