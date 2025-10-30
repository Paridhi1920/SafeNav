import pandas as pd
from config.config import Config

def load_crime_data():
    """Load and preprocess crime dataset"""
    df = pd.read_csv(Config.DATASET_PATH)

    # timestamp ko datetime me convert (dayfirst bhi true rakha hai India ke format ke liye)
    if "timestamp" in df.columns:
        df["timestamp"] = pd.to_datetime(
            df["timestamp"], 
            dayfirst=True, 
            errors="coerce"
        )
    df = df.dropna(subset=["timestamp"])

    return df
