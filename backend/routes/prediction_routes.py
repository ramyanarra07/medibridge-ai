from flask import Blueprint, request, jsonify
from backend.services.ml_service import ml_service
from backend.routes.auth_middleware import token_required

prediction_bp = Blueprint('predictions', __name__, url_prefix='/api/predictions')

@prediction_bp.route('/predict-all', methods=['POST'])
def predict_all():
    """
    Direct standalone inference endpoint for the interactive Disease Prediction Page.
    Accepts arbitrary vitals values and runs all 4 models with XAI explanations.
    """
    data = request.get_json() or {}
    try:
        results = ml_service.predict_all_conditions(data)
        return jsonify({
            'status': 'success',
            'predictions': results
        })
    except Exception as e:
        return jsonify({'error': f'Prediction execution error: {str(e)}'}), 500

@prediction_bp.route('/metadata', methods=['GET'])
def get_metadata():
    """Returns training parameters, model metrics, datasets, and XAI feature weights."""
    return jsonify(ml_service.get_metadata())
