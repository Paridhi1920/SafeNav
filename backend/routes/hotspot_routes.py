from flask import Blueprint, request, jsonify
from services.hotspot_service import get_area_analysis

hotspot_bp = Blueprint("hotspot", __name__)

@hotspot_bp.route("/area-info", methods=["POST"])
def area_info():
    """
    Get safety score, top crimes, and charts for a specific area
    """
    data = request.get_json()
    area = data.get("area")

    if not area:
        return jsonify({"error": "Please provide an area name."}), 400

    result = get_area_analysis(area)
    return jsonify(result)