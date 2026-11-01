import os
import sys
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

# Add root directory to sys.path
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.config import Config
from backend.database.db import db
from backend.database.seed_data import seed_database
from backend.routes.auth_routes import auth_bp
from backend.routes.patient_routes import patient_bp
from backend.routes.doctor_routes import doctor_bp
from backend.routes.caregiver_routes import caregiver_bp
from backend.routes.alert_routes import alert_bp
from backend.routes.prediction_routes import prediction_bp

def create_app(config_class=Config):
    app = Flask(__name__, static_folder="../frontend/dist", static_url_path="")
    app.config.from_object(config_class)

    # Enable Cross-Origin Resource Sharing (CORS)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize Database
    db.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(patient_bp)
    app.register_blueprint(doctor_bp)
    app.register_blueprint(caregiver_bp)
    app.register_blueprint(alert_bp)
    app.register_blueprint(prediction_bp)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'platform': 'Medi Bridge AI Virtual Ward',
            'version': '1.0.0',
            'academic_edition': True
        })

    # Serve built React frontend if distribution exists
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        elif os.path.exists(os.path.join(app.static_folder, 'index.html')):
            return send_from_directory(app.static_folder, 'index.html')
        else:
            return jsonify({
                'system': 'Medi Bridge AI Backend API is online.',
                'frontend_status': 'Development Mode. Connect via React dev server on port 5173.',
                'documentation': '/api/health'
            })

    # Auto-seed database if empty
    with app.app_context():
        db.create_all()
        from backend.database.models import User
        if not User.query.first():
            print("No users found in database. Running auto-seeder...")
            seed_database(app)

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"================================================================")
    print(f" Medi Bridge AI Virtual Ward Backend Server starting on port {port}")
    print(f" Academic Prototype - 4 Chronic Conditions ML Engine Active")
    print(f"================================================================")
    app.run(host='0.0.0.0', port=port, debug=True)
