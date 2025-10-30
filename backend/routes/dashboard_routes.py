from flask import Blueprint, jsonify

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/", methods=["GET"])
def get_dashboard_data():
    """
    API to fetch dashboard data:
    - crime growth/decline
    - category distribution
    - top dangerous areas
    - city-wise stats
    """
    response = {
        "crime_growth": [50, 70, 65, 80, 90],  # dummy trend
        "category_distribution": {
            "Theft": 45,
            "Robbery": 25,
            "Assault": 20,
            "Cybercrime": 10
        },
        "top_dangerous_areas": [
            {"area": "Rajwada", "crime_count": 95},
            {"area": "Vijay Nagar", "crime_count": 120},
            {"area": "Palasia", "crime_count": 80},
        ],
        "city_wise_statistics": {
            "Indore": 300,
            "Bhopal": 250,
            "Ujjain": 120
        }
    }
    return jsonify(response)
