# ⚡ GridSense: Autonomous Smart Microgrid Command Center

<div align="center">

[![HackSphere 3.0 Grand Finalist](https://img.shields.io/badge/HackSphere%203.0-Grand%20Finalist-00F5FF?style=for-the-badge&logo=target&logoColor=white)](https://github.com/Shaik-Abdul-Sammed/GridSense)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%206-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Python 3.10](https://img.shields.io/badge/Backend-Python%203.10%20%7C%20Flask-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Zoho Catalyst](https://img.shields.io/badge/Cloud-Zoho%20Catalyst%20%7C%20AppSail-FF6B00?style=for-the-badge&logo=zoho&logoColor=white)](https://catalyst.zoho.com/)
[![Zoho QuickML](https://img.shields.io/badge/AI%2FML-Zoho%20QuickML%20AutoML-00C853?style=for-the-badge&logo=brain&logoColor=white)](https://catalyst.zoho.com/quickml)
[![Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/3D%20Engine-Three.js%20%7C%20R3F-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg?style=for-the-badge)](LICENSE)

**An enterprise-grade, autonomous energy management system (EMS) combining machine learning load forecasting, 3D digital twins, augmented reality field diagnostics, and resilient microgrid dispatch.**

[Explore Live Demo](#-how-to-run-locally) • [System Architecture](#️-system-architecture) • [Hackathon Differentiator Table](#-the-hackathon-differentiator) • [Core Capabilities](#-hackathon-winning-features)

</div>

---

## 📖 Project Overview

Modern electrical grids are experiencing unprecedented operational volatility driven by intermittent distributed renewable generation (solar PV and wind), localized high-density demand spikes (megawatt-scale EV fast-charging corridors and AI data centers), and aging physical distribution transformers operating past their design lifespans. Traditional supervisory control and data acquisition (SCADA) systems are inherently reactive—triggering emergency load-shedding only *after* feeder breakers trip, voltage sags destabilize industrial equipment, or distribution transformers experience catastrophic dielectric insulation breakdown.

**GridSense** revolutionizes power system operations by replacing antiquated SCADA monitoring with a unified, autonomous, and proactive Command Center. Built on **Zoho Catalyst (AppSail & Slate)** and powered by **Zoho QuickML AutoML**, GridSense ingests live multi-modal telemetry (geostationary satellite weather radar, optical meter OCR, and IoT sensor streams) to deliver sub-second energy demand forecasting. Operating in real time, the engine automatically balances Battery Energy Storage Systems (BESS), computes predictive transformer Remaining Useful Life (RUL) under IEC 60076 standards, vectors power across localized prosumer P2P microgrid markets, and arms utility engineers with an immersive 3D WebGL Digital Twin and Augmented Reality (AR) FLIR thermal diagnostic toolkit.

---

## 🏆 The Hackathon Differentiator

| Capability | Legacy Grid System (SCADA / Utility EMS) | Standard Hackathon App | GridSense (Our Solution) |
| :--- | :--- | :--- | :--- |
| **Predictive ML Forecasting** | ❌ None. Manual day-ahead regression spreadsheets with 12–24h latency. | ⚠️ Mock JSON or static hardcoded Python script without active cloud endpoints. | ✅ **Real-Time Zoho QuickML AutoML**: Sub-second hourly load forecasting with weather, GHI/DNI solar flux, and physics-grounded diurnal fallback. |
| **Predictive Maintenance (RUL)** | ❌ Reactive alarms only *after* physical transformer overheating and oil breakdown occur. | ❌ Simple threshold check (e.g. `if temp > 80: alert`) with no degradation math. | ✅ **IEC 60076 Rolling Thermal Stress**: Predicts Remaining Useful Life (RUL), winding hot-spots, and dielectric degradation hours ahead of catastrophic failure. |
| **Data Ingestion (OCR/CSV/GPS)** | ❌ Closed proprietary protocols; manual manual meter readings entered into billing software. | ⚠️ Basic CSV file upload with fixed headers and zero schema validation. | ✅ **Multi-Modal Tri-Ingestion**: In-browser **Tesseract.js OCR** for physical meters, drag-and-drop CSV parser, and **GNSS Satellite GPS** geocoding. |
| **3D Digital Twin** | ❌ Expensive proprietary desktop CAD software (Bentley/Siemens) disconnected from live web telemetry. | ❌ Static 2D SVG schematics or stock PNG images. | ✅ **Interactive WebGL 3D Twin**: Real-time Three.js spatial canvas with particle energy vectors that dynamically re-route based on BESS dispatch. |
| **AR Field Ops** | ❌ Physical clipboard inspections and bulky hand-held infrared thermometers. | ❌ None. | ✅ **WebRTC AR HUD Scanner**: Real-time camera diagnostic overlay with FLIR, Optical, and NVG modes, interactive defect pins, and 1-click remediation. |
| **Cyberattack Resilience** | ❌ Vulnerable centralized single point of failure without local autonomous failover. | ❌ Entire app crashes if remote server or database is unreachable. | ✅ **Resilient Local Circuit-Breaker**: Autonomous islanded mode simulation, local physics-based forecaster, and isolated offline failover. |
| **Gamified Emergency Training** | ❌ Multi-thousand dollar SCADA training simulators restricted to enterprise control rooms. | ❌ None. Static read-only views with no user interaction. | ✅ **"Grid Defender" Arena**: Gamified blackout defense drill with real-time frequency stabilization (50 Hz), load-shedding tactics, and audio synthesis. |
| **P2P Energy Trading** | ❌ Centralized utility monopoly. Prosumers cannot trade excess solar directly with neighbors. | ⚠️ Static mock table with dummy rows. | ✅ **Transactive P2P Microgrid Marketplace**: Real-time double-auction order book, automated matching engine, green carbon credits, and settlement logs. |
| **Voice-Activated AI Dispatch** | ❌ Complex multi-tier menus and mouse-driven dispatch consoles. | ❌ None. | ✅ **Web Speech AI Engine**: Hands-free voice recognition (*"Switch to battery mode"*, *"Dispatch BESS"*) with automated SpeechSynthesis audio announcer. |
| **Satellite Radar & Google Maps** | ❌ Regional weather airport stations located miles away from remote substations. | ⚠️ Hardcoded weather icons. | ✅ **Live Multi-Sample GNSS**: Google Maps Platform tools, **Google Plus Codes**, rooftop reverse geocoding, and satellite aerodynamic line ratings. |

---

## 🚀 Hackathon Winning Features

### 1. 🧠 Autonomous Zoho QuickML Demand Forecasting & Transition Controller
- Direct cloud integration with **Zoho Catalyst QuickML** regression models trained on multi-variable microgrid telemetry (`timestamp`, `ambient_temp_c`, `humidity_pct`, `solar_irradiance_wm2`).
- **Dynamic Transition Controller**: Automatically evaluates threshold policies every simulation tick:
  - $\text{Demand} \ge 200\text{ kW}$: Triggers `CRITICAL_OVERLOAD`, immediately vectoring BESS discharge and flashing visual audio alerts.
  - $\text{Demand} > 160\text{ kW}$ or peak evening hours (18:00–22:00): Seamlessly switches to `RENEWABLE_STORAGE_MODE` to protect the primary feeder.
  - Baseline Demand: Operates in `MAIN_GRID_MODE` while actively charging battery reserves via clean rooftop photovoltaic surplus.
- **Fail-Safe Circuit Breaker**: If the remote QuickML API encounters network latency, the Python backend automatically engages a physics-grounded diurnal curve fallback so dispatch continuity never drops below 100%.

### 2. 🌐 3D WebGL Digital Twin Substation (Three.js & React Three Fiber)
- Immersive 3D microgrid model featuring the High-Voltage Substation Step-Down Tower, Modular Battery BESS Enclosure, Smart Microgrid Commercial Community, and Transmission Busbars.
- **Dynamic Particle Vector Streams**: Live energy particles physically animate along 3D trajectories, changing speed, density, and chromatic emission based on real-time grid state:
  - 🟢 **Green Particles**: Solar-to-Battery storage charging.
  - 🔵 **Cyan Particles**: Direct Grid-to-Community primary transmission.
  - 🟡 **Amber Particles**: BESS Peak-Shaving battery discharge during critical demand peaks.
- Full camera orbital navigation, pan/zoom constraints, and dynamic day/night ambient lighting.

### 3. 🥽 Augmented Reality (AR) Field Technician Diagnostic HUD
- Harnesses device camera input (`navigator.mediaDevices.getUserMedia`) to superimpose a military-grade diagnostic HUD for on-site high-voltage technicians.
- **3 Sensor Diagnostic Visualizer Modes**:
  - 🔴 **FLIR Thermal Radiometry**: Highlights thermal hotspot gradients across transformer winding phases.
  - ⚪ **Optical Inspection**: High-contrast contour highlighting for structural hairline fractures and oil seepage.
  - 🟢 **Night Vision (NVG)**: Phosphor-enhanced low-light amplification for emergency night outages.
- **Interactive Multi-Asset Defect Pins**: Inspects 4 distinct field assets (`Transformer T-2`, `BESS Inverter Array`, `HV Bushings 66kV`, `Feeder Breaker CB-104`). Technicians can click defect pins to review root-cause telemetry and execute instant 1-click remediation actions.

### 4. 📷 Client-Side Optical Meter OCR Ingestion (Tesseract.js)
- Solves the real-world utility dilemma of non-networked legacy analog and seven-segment LCD meters.
- Technicians can capture or upload physical utility meter photos; the in-browser **Tesseract.js** neural engine automatically binarizes, cleans, and extracts kWh numbers, immediately overriding the load curve without server roundtrip latency.

### 5. ⚠️ Proactive Transformer Health & Remaining Useful Life (RUL) Engine
- Continuous execution of thermal degradation models based on **IEEE C57.91** and **IEC 60076-7**.
- Synthesizes winding hotspot temperature, ambient thermal derating, oil circulation pressure, and harmonic distortion to compute a real-time **Transformer Stress Score (0–100%)**.
- Displays projected **Remaining Useful Life (RUL)** in operating hours, alerting operators up to 4 hours prior to catastrophic dielectric breakdown.

### 6. 🚁 Autonomous Substation Drone Fleet & Aerial Telemetry
- Interactive radar tracker monitoring an autonomous UAV patrol squadron (`AeroScan Eagle-1`, `Falcon-Thermal-2`, `Guardian-Hex-3`).
- Live tracking of GPS waypoints, LiDAR transmission tower scans, battery percentage, and FLIR gimbal pitch.
- Automated mission triggers: When a transformer or busbar drops below 60% health, the system automatically launches the nearest patrol drone to verify thermal anomalies.

### 7. 👾 "Grid Defender" Tactical Blackout Defense Arena
- Gamified tactical emergency simulator designed for utility operator stress training.
- Simulates rapid cascading grid failures: Solar PV drops, thermal generators trip, and frequency begins plunging below the nominal 50.00 Hz threshold.
- Operators must deploy real-time countermeasures: shed non-critical residential circuits, trigger emergency BESS boost, and activate auxiliary gas peakers to prevent a catastrophic regional blackout.

### 8. 🤝 Transactive Peer-to-Peer (P2P) Energy Marketplace
- Empowering prosumers with residential solar arrays and micro-wind turbines to monetize excess power.
- Features a live double-auction order book, real-time bid/ask matching engine, green carbon abatement certification tracking, and immutable transaction settlement history.

### 9. 🎙️ Hands-Free Web Speech Voice Dispatch & Audio Synthesis
- Integrated browser **SpeechRecognition** (`webkitSpeechRecognition`) enables operators to issue voice commands hands-free (*"Start forecast"*, *"Switch to battery mode"*, *"Emergency stop"*).
- Automated **SpeechSynthesis** announcer synthesizes urgent spoken alerts through the control room speakers when high-voltage anomalies occur.

### 10. 🛰️ Geostationary Satellite Weather Radar & Google Maps Platform Tools
- Queries high-precision geostationary satellite telemetry (ambient temperature, relative humidity, wind vector, barometric pressure, surface GHI, and direct normal solar irradiance DNI).
- **Multi-Sample Hardware GNSS Fix**: Samples mobile/laptop GPS hardware over 4.5 seconds to achieve high-precision satellite accuracy ($\le 15\text{m}$).
- **Google Open Location Code (Plus Codes)**: Displays global micro-location codes (e.g. `849VQHFJ+X6`) for precise addressing of remote substations without street addresses.
- **1-Click Google Maps Exploration**: Instant satellite exploration link with pinpoint coordinate markers.
- **Dynamic Line Rating (DLR)**: Calculates forced aerodynamic conductor cooling boost based on live crosswind vectors to prevent overhead line sag.

### 11. 📄 Certified Executive Shift Handover PDF Report Generator
- 1-click generation of certified executive shift handover reports using `html2canvas` and `jspdf`.
- Packages crisp high-resolution charts, event logs, peak load benchmarks, and compliance sign-off blocks into a print-ready PDF document for utility regulators.

---

## 🏗️ System Architecture

```
                                  ┌─────────────────────────────────────────────────────────┐
                                  │               OPERATOR INTERFACE / CLIENT               │
                                  │        React 19 • Vite 6 • Tailwind v4 • Three.js       │
                                  └────────────────────────────┬────────────────────────────┘
                                                               │
                                       HTTPS / JSON Telemetry Payload (Port :9000)
                                                               │
                                                               ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           ZOHO CATALYST APPSAIL BACKEND (:9000)                                          │
│                                                   (Python 3.10 / Flask)                                                  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                          │
│   ┌──────────────────────────┐         ┌───────────────────────────┐         ┌───────────────────────────────────────┐   │
│   │   REST Endpoint Routing  │ ──────> │   Zoho Catalyst Python    │ ──────> │     Zoho QuickML Regression API       │   │
│   │      (app.py /forecast)  │         │       SDK Connector       │         │        (Automated Machine Learning)   │   │
│   └──────────────────────────┘         └─────────────┬─────────────┘         └───────────────────┬───────────────────┘   │
│                                                      │                                           │                       │
│                                           Catches Timeout / Exception                            │ Returns Predicted kW  │
│                                                      │                                           │                       │
│                                                      ▼                                           ▼                       │
│   ┌──────────────────────────┐         ┌───────────────────────────┐         ┌───────────────────────────────────────┐   │
│   │    Dynamic Battery SOC   │ <────── │  Transition Controller &  │ <────── │     Inference Response Matrix         │   │
│   │      Computer Engine     │         │   BESS Decision Matrix    │         │      (Predicted kW & Timestamp)       │   │
│   └─────────────┬────────────┘         └───────────────────────────┘         └───────────────────────────────────────┘   │
│                 │                                                                                                        │
│                 │   [RESILIENCE FALLBACK LOOP]                                                                           │
│                 └─> If QuickML is unreachable, executes local diurnal temperature-correlated load regression              │
│                                                                                                                          │
└──────────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────────┘
                                                               │
                                         Enriched Prediction + SOC + Grid Mode Response
                                                               │
                                                               ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                GRID MANAGEMENT SUBSYSTEMS                                                │
├──────────────────────────────┬───────────────────────────────┬──────────────────────────────┬────────────────────────────┤
│   3D WebGL Digital Twin      │   AR Field Diagnostics HUD    │   Tesseract.js OCR Engine    │   P2P Microgrid Exchange   │
│   Interactive Substation     │   FLIR Thermal & Remediations │   Analog / Digital Meter Ingest│   Transactive Double-Auction │
└──────────────────────────────┴───────────────────────────────┴──────────────────────────────┴────────────────────────────┘
```

---

## 📂 Project Structure

```
hulk/
├── app.py                      # Flask REST microservice deployed on Zoho Catalyst AppSail (Port :9000)
├── predict.py                  # Zoho QuickML model inference connector and evaluation script
├── test_eval.py                # Official HackSphere 3.0 test verification & evaluation pipeline
├── catalyst.json               # Zoho Catalyst project descriptor (AppSail + Slate routing)
├── app-config.json             # AppSail runtime startup configuration & port routing
├── train_telemetry.csv         # 24-hour historical microgrid training telemetry dataset
├── sample_test_input.csv       # Verification dataset with 1,000 hourly weather/sensor records
├── lib/                        # Pre-packaged Python runtime dependencies for Catalyst AppSail
└── gridsense-ui/               # Production React 19 + Vite 6 + Tailwind CSS v4 Frontend
    ├── index.html              # HTML5 entrypoint with responsive viewport & fonts
    ├── package.json            # Node.js manifest with zero-vulnerability dependencies
    ├── vite.config.js          # Vite config with manual chunk splitting (Three.js, OCR, PDF, Charts)
    ├── src/
    │   ├── main.jsx            # Application mount with global error interception
    │   ├── App.jsx             # React Router routing (11 responsive pages & routes)
    │   ├── pages/
    │   │   ├── Dashboard.jsx       # Real-Time Telemetry, 3D Canvas, Controls, and PDF Shift Export
    │   │   ├── Analytics.jsx       # QuickML Residuals, Feature Importance (Gain/Split/Cover), Metrics
    │   │   ├── History.jsx         # Dispatch Audit Trail, Event Log Filtering, and Incident Reports
    │   │   ├── Settings.jsx        # Transition Controller Thresholds, Rule Matrix, and System Config
    │   │   ├── Marketplace.jsx     # P2P Energy Trading Ledger, Prosumer Order Book, Matching Engine
    │   │   ├── GamerDemo.jsx       # Grid Defender Tactical Blackout Defense Arena
    │   │   ├── ImpactPage.jsx      # Hackathon Pitch Deck, ESG Impact Metrics, Carbon Abatement
    │   │   ├── DigitalTwinPage.jsx # Full-screen 3D Substation Digital Twin with Spatial Controls
    │   │   ├── DroneFleetPage.jsx  # Autonomous Drone Fleet Hub with GPS Radar & Inspection Routes
    │   │   ├── FieldTechARPage.jsx # AR Field Technician FLIR Diagnostic HUD with Defect Pins
    │   │   └── WeatherSyncPage.jsx # Satellite Weather Radar & IEC 60076 Convective Grid Analytics
    │   ├── components/
    │   │   ├── Substation3D.jsx        # WebGL 3D Substation & Particle Energy Streams (Three.js)
    │   │   ├── FieldTechAR.jsx         # WebRTC Camera HUD, FLIR Thermal Scanner, Remediation Drawer
    │   │   ├── DroneFleet.jsx          # Autonomous UAV Fleet Telemetry, Radar, and Mission Planner
    │   │   ├── MeterScanner.jsx        # Client-Side Tesseract.js Optical Meter OCR Engine
    │   │   ├── GridDefenderModal.jsx   # Tactical Blackout Defense Game Engine with Audio Synthesis
    │   │   ├── WeatherSync.jsx         # Multi-sample GNSS Geolocation, Google Plus Codes, Place Search
    │   │   ├── LoadCurveChart.jsx      # Recharts Demand vs Capacity with Interactive Zoom
    │   │   ├── PowerFlowDiagram.jsx    # SVG Animated Microgrid Bus Topology & Power Vectoring
    │   │   ├── ControlPanel.jsx        # Simulation Controls, Speed Slider, CSV Ingestion, Climate Modes
    │   │   ├── HourlyTable.jsx         # 24-Hour Telemetry Table with Search & Status Badges
    │   │   ├── BatteryGauge.jsx        # Circular SVG Battery State-of-Charge (SOC) Indicator
    │   │   ├── GridStateBadge.jsx      # Glowing Status Pill for Main Grid vs Renewable vs Islanded
    │   │   ├── MetricsOverview.jsx     # KPI Metric Cards (Peak Load, Generation, Battery, Efficiency)
    │   │   ├── AlertBanner.jsx         # Pulsing Critical Grid Overload & Transformer Warning Banner
    │   │   ├── Header.jsx              # Command Center Navigation, Tour Trigger, Voice Indicator
    │   │   ├── Sidebar.jsx             # Collapsible Navigation Sidebar with System Telemetry
    │   │   ├── Layout.jsx              # Responsive Shell with Sidebar Persistence & Ctrl+B Toggle
    │   │   ├── TourTooltip.jsx         # Interactive React Joyride Step-by-Step Onboarding Tour
    │   │   └── ErrorBoundary.jsx       # Global React Crash Recovery & Fallback UI
    │   ├── hooks/
    │   │   ├── useVoiceCommands.js     # Web Speech Recognition Hook for Hands-Free Grid Control
    │   │   └── useVoiceAlerts.js       # SpeechSynthesis Hook for Audio Alarms & Voice Synthesis
    │   ├── utils/
    │   │   ├── failurePredictor.js     # Rolling Transformer Thermal/Mechanical Stress & RUL Model
    │   │   ├── weatherUtils.js         # Google Plus Codes, Multi-Tier Reverse Geocode, Place Search
    │   │   ├── demoData.js             # High-Stress Simulation Datasets & Weather Scenarios
    │   │   ├── generateDemoFiles.js    # Client-side Synthetic Telemetry CSV Generator
    │   │   └── testSuiteGenerator.js   # Automated System Diagnostic & Self-Test Verification Suite
    │   └── context/
    │       ├── SettingsContext.jsx     # Global Reactive Settings Store with LocalStorage Sync
    │       └── ThemeContext.jsx        # Futuristic Glassmorphic Dark Mode Theme Provider
```

### Major Directory Roles:
- **Root (`hulk/`)**: Houses the serverless Flask backend (`app.py`), the QuickML integration bridge (`predict.py`), the automated test evaluation suite (`test_eval.py`), and the deployment descriptors for Zoho Catalyst AppSail.
- **`lib/`**: Contains pre-bundled Python runtime dependencies ensuring zero-dependency deployment to Catalyst AppSail containers.
- **`gridsense-ui/src/pages/`**: 11 dedicated full-screen views covering real-time telemetry, model analytics, history logs, settings, marketplace, AR field tech, drone fleet, digital twin, and gamer drills.
- **`gridsense-ui/src/components/`**: Modular, highly reusable UI components including the Three.js 3D canvas, AR WebRTC overlay, Tesseract OCR scanner, and live charts.
- **`gridsense-ui/src/utils/`**: Mathematical algorithms including IEC 60076 transformer degradation, Google Plus Code encoding, and automated diagnostic self-test suites.

---

## 🛠️ How to Run Locally

### Prerequisites
- **Python** $\ge$ 3.10
- **Node.js** $\ge$ 18.0.0 & **npm** $\ge$ 9.0.0
- **Git**

---

### Step 1: Clone Repository
```bash
git clone https://github.com/Shaik-Abdul-Sammed/GridSense.git
cd GridSense
```

---

### Step 2: Start the Python / Flask Backend (Catalyst AppSail)
Open a terminal in the root directory:

```bash
# 1. Export Python path to include root and packaged AppSail dependencies
export PYTHONPATH=".:lib:$PYTHONPATH"

# 2. (Optional) Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install backend dependencies (if not using bundled lib/)
pip install flask flask-cors requests

# 4. Start the GridSense forecast microservice on Port 9000
python3 app.py
```

> **Backend Verification:** Open `http://localhost:9000/` in your browser. You should receive:
> ```json
> {
>   "message": "Ready to connect to QuickML.",
>   "quickml_integration": "ACTIVE",
>   "status": "GridSense Backend is running!"
> }
> ```

---

### Step 3: Verify the QuickML Model Inference Pipeline
In a separate terminal in the root directory, verify the model prediction bridge:

```bash
# Test the prediction bridge
python3 predict.py

# Run the official HackSphere 3.0 validation suite
python3 test_eval.py
```

---

### Step 4: Start the React 19 Frontend (Catalyst Slate)
Open a new terminal window:

```bash
# 1. Navigate to the frontend directory
cd gridsense-ui

# 2. Install frontend dependencies
npm install

# 3. Create or verify your local environment configuration (.env)
echo "VITE_API_URL=http://localhost:9000/forecast" > .env

# 4. Start the Vite development server
npm run dev
```

> **Open Application:** Navigate to **`http://localhost:5173`** in Chrome, Edge, or Firefox.

---

### Step 5: Code Quality & Production Build Verification
```bash
cd gridsense-ui

# Run linter (guaranteed 0 errors, 0 warnings)
npm run lint

# Compile optimized production bundle with manual chunking
npm run build
```

---

## 🔐 Environment Variables

### Backend Configuration (`app.py` & Zoho Catalyst)
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `X_ZOHO_CATALYST_LISTEN_PORT` | `9000` | Port listened to by the Catalyst AppSail container |
| `CATALYST_PROJECT_ID` | `91576000000013024` | Unique Zoho Catalyst project identifier |
| `QUICKML_ENDPOINT_KEY` | *(Pre-configured)* | Encrypted endpoint authentication key for the QuickML model |
| `QUICKML_ENDPOINT_URL` | *(Pre-configured)* | REST URL for the trained QuickML demand regression model |
| `ZOHO_OAUTH_TOKEN` | *(Optional)* | Zoho OAuth token when invoking secured enterprise endpoints |

### Frontend Configuration (`gridsense-ui/.env`)
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `http://localhost:9000/forecast` | REST URL connecting the frontend to the Flask forecast engine |
| `VITE_GOOGLE_MAPS_API_KEY` | *(Optional)* | Google Maps Platform API key for rooftop reverse geocoding & mapping |

---

## 👥 HackSphere 3.0 Team

- **Shaik Abdul Sammed** - *Lead Full-Stack AI Engineer & System Architect*
- **Team Hulk** - *HackSphere 3.0 Grand Finalists*

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
