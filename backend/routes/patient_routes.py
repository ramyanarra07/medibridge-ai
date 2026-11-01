from flask import Blueprint, request, jsonify
from datetime import datetime
from backend.database.db import db
from backend.database.models import Patient, HealthRecord, DiseasePrediction, User, ClinicalNote
from backend.services.ml_service import ml_service
from backend.services.adaptive_monitoring import analyze_and_adapt
from backend.services.report_service import generate_patient_health_report
from backend.routes.auth_middleware import token_required

patient_bp = Blueprint('patient', __name__, url_prefix='/api/patients')

@patient_bp.route('/<int:patient_id>', methods=['GET'])
@token_required()
def get_patient(current_user, patient_id):
    patient = Patient.query.get_or_404(patient_id)
    return jsonify({'patient': patient.to_dict()})

@patient_bp.route('/<int:patient_id>', methods=['PUT'])
@token_required()
def update_patient_profile(current_user, patient_id):
    patient = Patient.query.get_or_404(patient_id)
    data = request.get_json() or {}

    if 'date_of_birth' in data:
        patient.date_of_birth = data['date_of_birth']
    if 'gender' in data:
        patient.gender = data['gender']
    if 'blood_group' in data:
        patient.blood_group = data['blood_group']
    if 'emergency_contact' in data:
        patient.emergency_contact = data['emergency_contact']
    if 'ward_bed_no' in data:
        patient.ward_bed_no = data['ward_bed_no']
    if 'medical_history_summary' in data:
        patient.medical_history_summary = data['medical_history_summary']
    if 'monitoring_status' in data and current_user.role in ['doctor', 'admin']:
        patient.monitoring_status = data['monitoring_status']

    # Update user basic fields if provided
    if 'full_name' in data and patient.user:
        patient.user.full_name = data['full_name']
    if 'phone' in data and patient.user:
        patient.user.phone = data['phone']

    db.session.commit()
    return jsonify({'message': 'Patient profile updated successfully', 'patient': patient.to_dict()})

@patient_bp.route('/<int:patient_id>/vitals', methods=['GET'])
@token_required()
def get_patient_vitals(current_user, patient_id):
    limit = request.args.get('limit', 50, type=int)
    records = (
        HealthRecord.query
        .filter_by(patient_id=patient_id)
        .order_by(HealthRecord.recorded_at.desc())
        .limit(limit)
        .all()
    )
    # Reverse so frontend gets chronological order for trend charts
    chronological = [r.to_dict() for r in reversed(records)]
    return jsonify({
        'patient_id': patient_id,
        'count': len(records),
        'records': chronological
    })

@patient_bp.route('/<int:patient_id>/vitals', methods=['POST'])
@token_required()
def add_patient_vitals(current_user, patient_id):
    patient = Patient.query.get_or_404(patient_id)
    data = request.get_json() or {}

    try:
        sbp = float(data.get('systolic_bp', 120))
        dbp = float(data.get('diastolic_bp', 80))
        hr = float(data.get('heart_rate', 72))
        glu = float(data.get('blood_glucose', 100))
        hba1c = float(data.get('hba1c', 5.6)) if data.get('hba1c') is not None else None
        bmi = float(data.get('bmi', 24.5))
        cr = float(data.get('serum_creatinine', 0.9)) if data.get('serum_creatinine') is not None else None
        urea = float(data.get('blood_urea', 25.0)) if data.get('blood_urea') is not None else None
        egfr = float(data.get('egfr', 95.0)) if data.get('egfr') is not None else None
        alb = float(data.get('albumin', 4.2)) if data.get('albumin') is not None else None
        hb = float(data.get('hemoglobin', 14.0)) if data.get('hemoglobin') is not None else None
        chol = float(data.get('total_cholesterol', 180.0)) if data.get('total_cholesterol') is not None else None
        angina = bool(data.get('exercise_induced_angina', False))
        symptoms = data.get('symptoms', 'None reported')
        notes = data.get('notes', 'Logged via Virtual Ward Telemetry Portal')
    except (ValueError, TypeError) as e:
        return jsonify({'error': f'Invalid vital sign data format: {str(e)}'}), 400

    new_record = HealthRecord(
        patient_id=patient_id,
        recorded_at=datetime.utcnow(),
        systolic_bp=sbp,
        diastolic_bp=dbp,
        heart_rate=hr,
        blood_glucose=glu,
        hba1c=hba1c,
        bmi=bmi,
        serum_creatinine=cr,
        blood_urea=urea,
        egfr=egfr,
        albumin=alb,
        hemoglobin=hb,
        total_cholesterol=chol,
        exercise_induced_angina=angina,
        symptoms=symptoms,
        notes=notes
    )
    db.session.add(new_record)
    db.session.flush()

    # Trigger Adaptive AI Monitoring & Alert Dispatch
    adaptive_result = analyze_and_adapt(patient_id, new_record.id, ml_service)

    return jsonify({
        'message': 'Vitals successfully recorded and analyzed by AI models',
        'record': new_record.to_dict(),
        'adaptive_evaluation': adaptive_result
    }), 201

@patient_bp.route('/<int:patient_id>/predictions', methods=['GET'])
@token_required()
def get_patient_predictions(current_user, patient_id):
    patient = Patient.query.get_or_404(patient_id)
    # Fetch most recent predictions for each condition
    predictions = (
        DiseasePrediction.query
        .filter_by(patient_id=patient_id)
        .order_by(DiseasePrediction.created_at.desc())
        .limit(8)
        .all()
    )

    # Group by condition to get latest of each
    latest_by_condition = {}
    for p in predictions:
        if p.condition_type not in latest_by_condition:
            latest_by_condition[p.condition_type] = p.to_dict()

    return jsonify({
        'patient_id': patient_id,
        'monitoring_status': patient.monitoring_status,
        'predictions': list(latest_by_condition.values())
    })

@patient_bp.route('/<int:patient_id>/report', methods=['GET'])
@token_required()
def get_patient_report(current_user, patient_id):
    report = generate_patient_health_report(patient_id)
    if not report:
        return jsonify({'error': 'Patient not found'}), 404
    return jsonify({'report': report})
