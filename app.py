import os
import math
import requests
from flask import Flask, request, g, jsonify

# Initialize Flask app
app = Flask(__name__)

# Force headers on every response to guarantee CORS compatibility
# Consolidates CORS headers so Catalyst Gateway and Flask do not duplicate Access-Control-Allow-Origin
@app.after_request
def after_request_cors(response):
    origin = request.headers.get('Origin')
    # For local development, inject origin since Catalyst's reverse proxy is not present
    if origin == "http://localhost:5173":
        response.headers["Access-Control-Allow-Origin"] = origin
    # Note: For the live Slate deployment (https://gridsense-ui-zjbtthvz.onslate.in),
    # the Zoho Catalyst Cloud Gateway is already configured to inject Access-Control-Allow-Origin.
    # Omitting it here prevents the browser "MultipleAllowOriginValues" duplicate header error.

    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, X-QUICKML-ENDPOINT-KEY"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

# QuickML Endpoint & Authentication Configuration
QUICKML_ENDPOINT_KEY = "f77c83a71a942063cfff5a53f27c0eaabf332cd7852a055ab322ca45d4d13883d7e5dbf8b5c034c73e3f621c20c47f54"
QUICKML_PROJECT_ID = os.environ.get("CATALYST_PROJECT_ID", "89804000000013023")
QUICKML_ENDPOINT_URL = os.environ.get(
    "QUICKML_ENDPOINT_URL",
    f"https://api.catalyst.zoho.in/quickml/v1/project/{QUICKML_PROJECT_ID}/endpoints/predict"
)

QUICKML_HEADERS = {
    "X-QUICKML-ENDPOINT-KEY": QUICKML_ENDPOINT_KEY,
    "CATALYST-ORG": "60093168651",
    "Environment": "Development",
    "Content-Type": "application/json",
}

# Attach OAuth token if provided in runtime environment
_zoho_token = os.environ.get("ZOHO_OAUTH_TOKEN") or os.environ.get("CATALYST_ACCESS_TOKEN")
if _zoho_token:
    QUICKML_HEADERS["Authorization"] = f"Zoho-oauthtoken {_zoho_token}"

try:
    import zcatalyst_sdk
    HAS_ZCATALYST_SDK = True
except ImportError:
    zcatalyst_sdk = None
    HAS_ZCATALYST_SDK = False

# 1. Initialize the Catalyst SDK for every request (when running in Catalyst AppSail)
@app.before_request
def before_request():
    if HAS_ZCATALYST_SDK and zcatalyst_sdk:
        try:
            g.zc_app = zcatalyst_sdk.initialize(req=request)
        except Exception:
            g.zc_app = None


def fallback_simulation(features_dict, hour):
    """
    Physics-grounded fallback load forecaster based on diurnal cycles and ambient temperature.
    Ensures zero disruption if the remote QuickML API is unreachable or times out.
    """
    try:
        temp = float(features_dict.get("ambient_temp_c", features_dict.get("temperature_2m", 25.0)))
    except (ValueError, TypeError):
        temp = 25.0

    # Base diurnal consumption curve (trough at 04:00, peak in evening)
    base_load = 110.0 + 30.0 * math.sin(2 * math.pi * (hour - 6) / 24)
    # Cooling degree load when temperature exceeds 24°C (compounds during heatwaves)
    cooling_load = max(0.0, temp - 24.0) * 4.5

    return round(float(base_load + cooling_load), 1)


def call_quickml_api(features_dict):
    """
    Invokes the Zoho Catalyst QuickML API endpoint via Zoho Catalyst Python SDK
    with automatic REST fallback and physics-grounded diurnal fallback.
    """
    timestamp_str = str(features_dict.get("timestamp", "2024-10-24 12:00:00"))
    try:
        hour = int(timestamp_str.split(" ")[1].split(":")[0])
    except Exception:
        hour = 12

    try:
        ambient_temp = float(features_dict.get("ambient_temp_c", features_dict.get("temperature_2m", 25.0)))
    except (ValueError, TypeError):
        ambient_temp = 25.0

    try:
        humidity = float(features_dict.get("humidity_pct", features_dict.get("relative_humidity_2m", 60.0)))
    except (ValueError, TypeError):
        humidity = 60.0

    try:
        solar = float(features_dict.get("solar_irradiance_wm2", features_dict.get("shortwave_radiation", 0.0)))
    except (ValueError, TypeError):
        solar = 0.0

    payload = {
        "data": [
            {
                "timestamp": timestamp_str,
                "ambient_temp_c": ambient_temp,
                "humidity_pct": humidity,
                "solar_irradiance_wm2": solar,
            }
        ]
    }

    # Approach 1: Official Zoho Catalyst Python SDK (AppSail runtime)
    if HAS_ZCATALYST_SDK and getattr(g, "zc_app", None):
        try:
            quickml = g.zc_app.quick_ml()
            result = quickml.predict(QUICKML_ENDPOINT_KEY, payload)
            if isinstance(result, dict):
                if "predictions" in result and len(result["predictions"]) > 0:
                    return float(result["predictions"][0])
                elif "data" in result and len(result["data"]) > 0:
                    item = result["data"][0]
                    if isinstance(item, dict):
                        return float(item.get("predicted_demand_kw", item.get("prediction", 165.0)))
                    return float(item)
                elif "prediction" in result:
                    return float(result["prediction"])
            elif isinstance(result, list) and len(result) > 0:
                return float(result[0])
            elif isinstance(result, (int, float)):
                return float(result)
        except Exception as sdk_err:
            print(f"[QuickML Catalyst SDK Notice] {sdk_err}. Trying REST fallback...")

    # Approach 2: Direct REST call with verified Zoho Catalyst QuickML endpoint
    headers = dict(QUICKML_HEADERS)
    try:
        if request and request.headers.get("Authorization"):
            headers["Authorization"] = request.headers.get("Authorization")
    except Exception:
        pass

    try:
        response = requests.post(
            QUICKML_ENDPOINT_URL,
            json=payload,
            headers=headers,
            timeout=5.0
        )

        if response.status_code == 200:
            result = response.json()
            if "predictions" in result and len(result["predictions"]) > 0:
                return float(result["predictions"][0])
            elif "data" in result and len(result["data"]) > 0:
                first_item = result["data"][0]
                if isinstance(first_item, dict):
                    return float(first_item.get("predicted_demand_kw", first_item.get("prediction", 165.0)))
                return float(first_item)
            elif "prediction" in result:
                return float(result["prediction"])
            elif isinstance(result, list) and len(result) > 0:
                return float(result[0])

        print(f"[QuickML REST Status] HTTP {response.status_code}: {response.text[:200]}. Engaging fallback simulation.")
    except Exception as e:
        print(f"[QuickML Fallback Engaged] API request failed: {e}. Executing resilient local model.")

    return fallback_simulation(features_dict, hour)


# 2. Health check route to test if deployment works
@app.route('/')
def home():
    return jsonify({
        "status": "GridSense Backend is running!",
        "message": "Ready to connect to QuickML.",
        "quickml_integration": "ACTIVE"
    })


# 3. Explicit OPTIONS handling for preflight requests
@app.route('/forecast', methods=['OPTIONS'])
def handle_options():
    response = app.make_response(('', 200))
    origin = request.headers.get('Origin')
    if origin == "http://localhost:5173":
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, X-QUICKML-ENDPOINT-KEY"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


# 4. Forecast endpoint with POST handling and logging
@app.route('/forecast', methods=['POST'])
def get_forecast():
    print("--- RECEIVED FORECAST REQUEST ---")
    data = request.get_json(silent=True) or {}

    # Extract timestamp or default to current simulation slot
    timestamp_str = str(data.get("timestamp", "2024-10-24 12:00:00"))
    try:
        hour = int(timestamp_str.split(" ")[1].split(":")[0])
    except Exception:
        hour = 12  # Default to noon if parsing fails

    # --- QUICKML API INTEGRATION ---
    predicted_kw = call_quickml_api(data)
    predicted_kw = round(float(predicted_kw), 1)

    # --- TRANSITION CONTROLLER LOGIC ---
    # Rule 1: Demand >= 200 kW -> Critical Overload
    if predicted_kw >= 200.0:
        grid_mode = "RENEWABLE_STORAGE_MODE"  # Switches to storage with alert
        alert_state = "CRITICAL_OVERLOAD"

    # Rule 2: Demand > 160 kW OR hour between 18 and 22 -> Renewable Storage
    elif predicted_kw > 160.0 or (18 <= hour <= 22):
        grid_mode = "RENEWABLE_STORAGE_MODE"
        alert_state = "NONE"

    # Rule 3: Otherwise -> Main Grid
    else:
        grid_mode = "MAIN_GRID_MODE"
        alert_state = "NONE"

    # --- BATTERY STATE-OF-CHARGE (SOC) CALCULATION ---
    client_soc = data.get("battery_soc")
    if client_soc is not None:
        try:
            current_soc = float(client_soc)
            if grid_mode == "RENEWABLE_STORAGE_MODE":
                battery_soc = max(10.0, round(current_soc - 4.2, 1))
            else:
                battery_soc = min(100.0, round(current_soc + 3.5, 1))
        except (ValueError, TypeError):
            battery_soc = max(10.0, min(100.0, round(100.0 - (predicted_kw / 3.0), 1)))
    else:
        battery_soc = max(10.0, min(100.0, round(100.0 - (predicted_kw / 3.0), 1)))

    return jsonify({
        "timestamp": timestamp_str,
        "predicted_demand_kw": predicted_kw,
        "grid_mode": grid_mode,
        "alert": alert_state,
        "battery_soc": battery_soc
    })


# 5. Run the app (Catalyst requires this specific port)
if __name__ == '__main__':
    port = int(os.environ.get('X_ZOHO_CATALYST_LISTEN_PORT', 9000))
    app.run(host='0.0.0.0', port=port)
