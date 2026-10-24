import os
from flask import Flask, request, g, jsonify
import zcatalyst_sdk

app = Flask(__name__)

# 1. Initialize the Catalyst SDK for every request
@app.before_request
def before_request():
    g.zc_app = zcatalyst_sdk.initialize(req=request)

# 2. Health check route to test if deployment works
@app.route('/')
def home():
    return jsonify({
        "status": "GridSense Backend is running!",
        "message": "Ready to connect to QuickML."
    })

# 3. Forecast endpoint (Includes the Transition Controller Logic)
@app.route('/forecast', methods=['POST'])
def forecast():
    data = request.json
    
    # --- PLACEHOLDER FOR QUICKML ---
    # Later, you will replace this dummy value with the actual prediction from QuickML
    predicted_kw = 175.0 
    
    # Extract the hour from the timestamp (e.g., "2024-10-24 19:00:00" -> 19)
    timestamp_str = data.get("timestamp", "2024-01-01 12:00:00")
    try:
        # Splitting the string to grab the hour number
        hour = int(timestamp_str.split(" ")[1].split(":")[0])
    except Exception:
        hour = 12 # Default to noon if parsing fails
        
    # --- TRANSITION CONTROLLER LOGIC ---
    # Rule 1: Demand >= 200 kW -> Critical Overload
    if predicted_kw >= 200:
        grid_mode = "RENEWABLE_STORAGE_MODE" # It still switches to storage, but with alert
        alert_state = "CRITICAL_OVERLOAD"
        
    # Rule 2: Demand > 160 kW OR hour between 18 and 22 -> Renewable Storage
    elif predicted_kw > 160 or (18 <= hour <= 22):
        grid_mode = "RENEWABLE_STORAGE_MODE"
        alert_state = "NONE"
        
    # Rule 3: Otherwise -> Main Grid
    else:
        grid_mode = "MAIN_GRID_MODE"
        alert_state = "NONE"
        
    # Return the final response
    return jsonify({
        "timestamp": timestamp_str,
        "predicted_demand_kw": predicted_kw,
        "grid_mode": grid_mode,
        "alert": alert_state
    })

# 4. Run the app (Catalyst requires this specific port)
if __name__ == '__main__':
    port = int(os.environ.get('X_ZOHO_CATALYST_LISTEN_PORT', 9000))
    app.run(host='0.0.0.0', port=port)
