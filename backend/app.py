from flask import Flask
from flask_cors import CORS

# Import blueprints (APIs from routes folder)
from routes.hotspot_routes import hotspot_bp
from routes.route_finder_routes import route_finder_bp
from routes.statistics_routes import statistics_bp
from routes.dashboard_routes import dashboard_bp

app = Flask(__name__, static_folder="static")
CORS(app)  # Enable Cross-Origin for frontend-backend communication

# Register Blueprints
app.register_blueprint(hotspot_bp, url_prefix="/hotspot")
app.register_blueprint(route_finder_bp, url_prefix="/route_finder")
app.register_blueprint(statistics_bp, url_prefix="/statistics")
app.register_blueprint(dashboard_bp, url_prefix="/dashboard")

@app.route("/")
def home():
    return {"message": "AI Crime Hotspot & Safety System API Running!"}


if __name__ == "__main__":
    app.run(debug=True)
