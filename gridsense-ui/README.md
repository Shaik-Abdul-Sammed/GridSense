# ⚡ GridSense UI - Smart Energy Microgrid Command Center

[![HackSphere 3.0 Finalist](https://img.shields.io/badge/HackSphere%203.0-Grand%20Finalist-00F5FF?style=for-the-badge&logo=target)](https://github.com/Shaik-Abdul-Sammed/GridSense)
[![Stack](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%206%20%7C%20Tailwind%20v4%20%7C%20Three.js-blueviolet?style=for-the-badge)](https://catalyst.zoho.com/)

> Modern, high-performance frontend for **GridSense**, an autonomous microgrid demand forecasting and energy management platform built on **Zoho Catalyst Slate**.

For the complete project overview, hackathon comparison table, and end-to-end architecture, see the primary [**Project README.md**](../README.md).

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (.env)
echo "VITE_API_URL=http://localhost:9000/forecast" > .env

# 3. Start development server
npm run dev

# 4. Verify code quality (zero warnings)
npm run lint

# 5. Production build with optimized chunk splitting
npm run build
```

---

## 📦 Production Bundle Architecture

GridSense implements Vite manual chunking and dynamic loading to isolate heavy dependencies:

- **`three-core-[hash].js`**: Three.js core runtime
- **`three-fiber-[hash].js`**: React Three Fiber, React Three Drei, WebGL shaders
- **`ocr-[hash].js`**: Tesseract.js engine and OCR worker scripts
- **`pdf-[hash].js`**: jsPDF & html2canvas report generation
- **`charts-[hash].js`**: Recharts and D3 dependencies
- **`react-[hash].js`**: React 19 core, ReactDOM, and React Router DOM
- **Dynamic Feature Chunks**: `Substation3D`, `FieldTechAR`, `DroneFleet`, `GridDefenderModal`, `MeterScanner`
