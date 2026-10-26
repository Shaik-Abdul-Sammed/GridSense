import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Three.js and 3D graphics libraries
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three-vendor';
            }
            // Tesseract OCR engine in isolated worker chunk
            if (id.includes('tesseract.js') || id.includes('tesseract')) {
              return 'ocr-vendor';
            }
            // PDF report generation in separate chunk
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'pdf-vendor';
            }
            // Everything else (React, ReactDOM, Recharts, D3, Lucide) bundled together to prevent circular dependency crashes
            return 'vendor';
          }
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
});
