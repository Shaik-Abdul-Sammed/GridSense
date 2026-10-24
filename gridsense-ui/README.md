# ⚡ GridSense UI - Smart Energy Microgrid Command Center

[![HackSphere 3.0 Finalist](https://img.shields.io/badge/HackSphere%203.0-Grand%20Finalist-00F5FF?style=for-the-badge&logo=target)](https://github.com/Shaik-Abdul-Sammed/GridSense)
[![Stack](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%206%20%7C%20Tailwind%20v4%20%7C%20Three.js-blueviolet?style=for-the-badge)](https://catalyst.zoho.com/)

> Modern, high-performance frontend for **GridSense**, an autonomous microgrid demand forecasting and energy management platform built on **Zoho Catalyst Slate**.

---

## 🚀 Features Overview

- **3D WebGL Digital Twin:** Interactive 3D microgrid model rendered using Three.js and `@react-three/fiber` with dynamic real-time energy flow particle streams.
- **Augmented Reality (AR) HUD:** Live camera feed with technician diagnostics overlays, hotspot indicators, and busbar frequency telemetry.
- **Optical Character Recognition (OCR):** In-browser analog and digital power meter ingestion via Tesseract.js.
- **Predictive Transformer Health Forecaster:** Rolling thermal/mechanical stress calculator with Remaining Useful Life (RUL) projections.
- **Voice Commands & Voice Announcer:** Hands-free command center operation via the Web Speech API.
- **Peer-to-Peer Energy Marketplace:** Transactive microgrid market with real-time order matching and trade settlements.
- **Autonomous Drone Fleet:** Telemetry-tracked UAV inspection network with automated battery and patrol status.
- **Export Shift Handover Reports:** Certified PDF generation with embedded high-resolution chart canvases and operator signature lines.

---

## 🛠️ Quick Start

```bash
# 1. Install dependencies (use legacy peer deps for three fiber)
npm install --legacy-peer-deps

# 2. Configure environment variables (.env)
echo "VITE_API_URL=http://localhost:9000/forecast" > .env

# 3. Start development server
npm run dev

# 4. Lint and verify code quality (zero warnings)
npm run lint

# 5. Production build with optimized chunk splitting
npm run build
```

---

## 📦 Production Bundle Architecture

GridSense implements Vite manual chunking and React lazy loading to isolate heavy dependencies:

- **`three-[hash].js`**: Three.js, React Three Fiber, React Three Drei
- **`ocr-[hash].js`**: Tesseract.js engine and OCR workers
- **`pdf-[hash].js`**: jsPDF & html2canvas report generation
- **`charts-[hash].js`**: Recharts and D3 dependencies
- **`react-[hash].js`**: React core, ReactDOM, and React Router DOM
- **Lazy Loaded Components:** `Substation3D`, `FieldTechAR`, `MeterScanner`, `DroneFleet`, `GridDefenderModal`
