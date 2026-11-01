from flask import Blueprint, request, jsonify
from datetime import datetime
from backend.database.db import db
from backend.database.models import Caregiver, Patient, Notification, DiseasePrediction
from backend.routes.auth_middleware import token_required

caregiver_bp = Blueprint('caregiver', __name__, url_prefix='/api/caregivers')

@caregiver_bp.route('/<int:caregiver_id>/patients', methods=['GET'])
@token_required()
def get_caregiver_patients(current_user, caregiver_id):
    caregiver = Caregiver.query.get_or_404(caregiver_id)
    patients = Patient.query.filter_by(assigned_caregiver_id=caregiver_id).all()
    
    # If no explicitly assigned patients, show all virtual ward patients for demonstration
    if not patients:
        patients = Patient.query.all()

    patient_cards = []
    for p in patients:
        p_dict = p.to_dict()
        latest_preds = DiseasePrediction.query.filter_by(patient_id=p.id).order_by(DiseasePrediction.created_at.desc()).limit(4).all()
        p_dict['latest_predictions'] = [lp.to_dict() for lp in latest_preds]
        
        # Pending alerts for this patient
        pending_alerts = Notification.query.filter_by(patient_id=p.id, is_read=False).count()
        p_dict['pending_alerts'] = pending_alerts
        patient_cards.append(p_dict)

    return jsonify({
        'caregiver': caregiver.to_dict(),
        'total_assigned': len(patient_cards),
        'patients': patient_cards
    })

@caregiver_bp.route('/alerts/acknowledge/<int:notification_id>', methods=['POST'])
@token_required()
def acknowledge_alert(current_user, notification_id):
    notif = Notification.query.get_or_404(notification_id)
    notif.is_read = True
    notif.acknowledged_by = current_user.id
    notif.acknowledged_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'message': 'Notification successfully acknowledged',
        'notification': notif.to_dict()
    })
