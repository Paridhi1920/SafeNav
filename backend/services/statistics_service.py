import pandas as pd
from config.config import Config

def get_statistics(area=None, month=None, crime_type=None):
    """
    Generate crime statistics based on filters (area, month, crime_type)
    """
    try:
        df = pd.read_csv(Config.DATASET_PATH)

        # Normalize column names
        df.columns = [c.strip().title().replace(" ", "_") for c in df.columns]

        # --- Apply filters ---
        if area and area != "All":
            df = df[df["Area"].str.lower() == area.lower()]
        if month and month != "All":
            df = df[df["Month"].astype(str).str.lower() == month.lower()]
        if crime_type and crime_type != "All":
            df = df[df["Crime_Type"].str.lower() == crime_type.lower()]

        if df.empty:
            return {"error": "No data found for selected filters."}

        # --- Yearly Trend ---
        yearly_df = (
            df.groupby("Year")["Crime_ID"].count().reset_index().sort_values("Year")
        )
        yearly_trend = {
            "years": yearly_df["Year"].astype(str).tolist(),
            "counts": yearly_df["Crime_ID"].tolist(),
        }

        # --- Monthly Trend ---
        monthly_df = (
            df.groupby("Month")["Crime_ID"].count().reset_index().sort_values("Month")
        )
        monthly_trend = {
            "months": monthly_df["Month"].astype(str).tolist(),
            "counts": monthly_df["Crime_ID"].tolist(),
        }

        # --- Crime Type Distribution ---
        type_dist = df["Crime_Type"].value_counts().to_dict()

        return {
            "yearly_trend": yearly_trend,
            "monthly_trend": monthly_trend,
            "crime_type_distribution": type_dist,
        }

    except Exception as e:
        return {"error": str(e)}
