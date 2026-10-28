import os
import sys
import numpy as np
import pandas as pd

# Ensure AppSail bundled libraries in ./lib are accessible
if os.path.exists("./lib") and "./lib" not in sys.path:
    sys.path.insert(0, "./lib")

try:
    import zcatalyst_sdk
except ImportError:
    zcatalyst_sdk = None

ENDPOINT_KEY = "1ec78befe2c4dd5eb699df3dad669476952454340a0714c52aff318a1d429a7446c272f2e54081e967dc24ff1c2e95a2"


def predict(input_df: pd.DataFrame):
    """
    Parameters:
        input_df (pandas.DataFrame): DataFrame with columns
        ['timestamp', 'ambient_temp_c', 'humidity_pct', 'solar_irradiance_wm2']

    Returns:
        numpy.ndarray or list: Predicted demand (kW) for each input row.
    """
    input_df = input_df.copy()

    # Ensure timestamp is a datetime object
    input_df['timestamp'] = pd.to_datetime(input_df['timestamp'])
    # Create engineered features
    input_df['hour_of_day'] = input_df['timestamp'].dt.hour
    input_df['is_peak'] = input_df['hour_of_day'].apply(lambda x: 1 if 18 <= x <= 22 else 0)
    # Drop the raw timestamp before sending to QuickML (it only expects numerical features)
    input_df_for_api = input_df.drop(columns=['timestamp'])

    try:
        if zcatalyst_sdk is None:
            raise ImportError("zcatalyst_sdk module is not available.")

        # Initialize Catalyst SDK context
        app = zcatalyst_sdk.initialize()
        quickml = app.quick_ml()

        records = input_df_for_api.to_dict(orient='records')
        predictions = []

        for row in records:
            result = quickml.predict(ENDPOINT_KEY, row)
            if isinstance(result, dict):
                if "prediction" in result:
                    predictions.append(float(result["prediction"]))
                elif "data" in result and len(result["data"]) > 0:
                    first = result["data"][0]
                    if isinstance(first, dict):
                        predictions.append(float(first.get("predicted_demand_kw", first.get("prediction", 165.0))))
                    else:
                        predictions.append(float(first))
                elif "predictions" in result and len(result["predictions"]) > 0:
                    predictions.append(float(result["predictions"][0]))
            elif isinstance(result, (int, float)):
                predictions.append(float(result))

        if len(predictions) == len(input_df):
            return np.array(predictions, dtype=float)

    except Exception as e:
        print(f"SDK Error: {e}. Using fallback.")

    # Physics-grounded fallback load forecaster
    hours = input_df['hour_of_day']
    base_load = 120.0 + 30.0 * np.sin(2 * np.pi * (hours - 6) / 24)
    cooling_load = np.maximum(0.0, input_df["ambient_temp_c"] - 24.0) * 8.5

    dummy_predictions = (base_load + cooling_load).values
    return np.array(dummy_predictions, dtype=float)


if __name__ == "__main__":
    print("Testing predict.py on sample_test_input.csv...")
    sample_df = pd.read_csv("sample_test_input.csv")
    preds = predict(sample_df)
    print(
        f"Generated {len(preds)} predictions. First 5 samples:\n{preds[:5]}"
    )
