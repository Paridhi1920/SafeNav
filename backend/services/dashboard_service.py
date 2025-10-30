import pandas as pd
from config.config import Config

def get_dashboard_data():
    """
    Dashboard: crime growth, category distribution, dangerous areas, city stats
    """
    try:
        df = pd.read_csv(Config.DATASET_PATH)

        # Crime growth per year
        crime_growth = df.groupby("Year")["Crime_ID"].count().tolist()

        # Category distribution
        category_distribution = df["Crime_Type"].value_counts().to_dict()

        # Top dangerous areas
        top_areas = df.groupby("Area")["Crime_ID"].count().reset_index()
        top_areas = top_areas.sort_values(by="Crime_ID", ascending=False).head(5).to_dict(orient="records")

        # City-wise stats
        city_stats = df.groupby("City")["Crime_ID"].count().to_dict()

        return {
            "crime_growth": crime_growth,
            "category_distribution": category_distribution,
            "top_dangerous_areas": top_areas,
            "city_wise_statistics": city_stats
        }

    except Exception as e:
        return {"error": str(e)}
