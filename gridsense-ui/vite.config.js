import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Three.js core
            if (id.includes('node_modules/three/')) {
              return 'three-core';
            }
            // R3F, Drei & helpers
            if (
              id.includes('@react-three') ||
              id.includes('three-stdlib') ||
              id.includes('three-mesh-bvh')
            ) {
              return 'three-fiber';
            }
            // Tesseract OCR engine in separate chunk
            if (id.includes('tesseract.js') || id.includes('tesseract')) {
              return 'ocr';
            }
            // PDF report generation in separate chunk
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('html2canvas-pro')) {
              return 'pdf';
            }
            // Core React runtime & routing
            if (
              id.includes('react-dom') ||
              id.includes('react-router') ||
              id.includes('react-router-dom') ||
              id.includes('/react/')
            ) {
              return 'react';
            }
            // Recharts & D3 mathematical utilities
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'charts';
            }
          }
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
});
