from flask import Blueprint, request, jsonify
from services.route_finder_service import get_safe_route

route_finder_bp = Blueprint("route_finder", __name__)

@route_finder_bp.route("/", methods=["GET"])
def find_route():
    """
    API: /route_finder/?origin=22.72,75.87&destination=22.75,75.90
    """
    origin = request.args.get("origin")
    destination = request.args.get("destination")
    mode = request.args.get("mode", "driving")

    if not origin or not destination:
        return jsonify({"error": "origin and destination required"}), 400

    result = get_safe_route(origin, destination, mode)
    return jsonify(result)
