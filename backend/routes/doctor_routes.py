from flask import Blueprint, request, jsonify
from datetime import datetime
from backend.database.db import db
from backend.database.models import Doctor, Patient, ClinicalNote, HealthRecord, DiseasePrediction, Notification, User
from backend.routes.auth_middleware import token_required

doctor_bp = Blueprint('doctor', __name__, url_prefix='/api/doctors')

@doctor_bp.route('/<int:doctor_id>/patients', methods=['GET'])
@token_required()
def get_doctor_patients(current_user, doctor_id):
    doctor = Doctor.query.get_or_404(doctor_id)
    patients = Patient.query.filter_by(assigned_doctor_id=doctor_id).all()
    
    # Also if doctor wants to see all virtual ward patients for triage
    include_all = request.args.get('all', 'false').lower() == 'true'
    if include_all or len(patients) == 0:
        patients = Patient.query.all()

    patient_summaries = []
    for p in patients:
        p_dict = p.to_dict()
        # Attach latest predictions for quick triage badge
        latest_preds = DiseasePrediction.query.filter_by(patient_id=p.id).order_by(DiseasePrediction.created_at.desc()).limit(4).all()
        p_dict['latest_predictions'] = [lp.to_dict() for lp in latest_preds]
        patient_summaries.append(p_dict)

    return jsonify({
        'doctor': doctor.to_dict(),
        'total_patients': len(patient_summaries),
        'patients': patient_summaries
    })

@doctor_bp.route('/patients/<int:patient_id>/status', methods=['PUT'])
@token_required(allowed_roles=['doctor', 'admin'])
def update_patient_status(current_user, patient_id):
    patient = Patient.query.get_or_404(patient_id)
    data = request.get_json() or {}

    old_status = patient.monitoring_status
    if 'monitoring_status' in data:
        patient.monitoring_status = data['monitoring_status']
    if 'ward_bed_no' in data:
        patient.ward_bed_no = data['ward_bed_no']
    if 'assigned_doctor_id' in data:
        patient.assigned_doctor_id = data['assigned_doctor_id']
    if 'assigned_caregiver_id' in data:
        patient.assigned_caregiver_id = data['assigned_caregiver_id']

    # Record notification if status changed
    if 'monitoring_status' in data and data['monitoring_status'] != old_status:
        notif = Notification(
            recipient_id=patient.id,
            patient_id=patient.id,
            severity='info',
            title='Monitoring Status Updated',
            message=f"Dr. {current_user.full_name} updated your virtual ward status to: {patient.monitoring_status}.",
            is_read=False
        )
        db.session.add(notif)

    db.session.commit()
    return jsonify({
        'message': 'Patient virtual ward status updated successfully',
        'patient': patient.to_dict()
    })

@doctor_bp.route('/patients/<int:patient_id>/notes', methods=['POST'])
@token_required(allowed_roles=['doctor', 'admin'])
def add_clinical_note(current_user, patient_id):
    patient = Patient.query.get_or_404(patient_id)
    data = request.get_json() or {}

    note_text = data.get('note_text', '').strip()
    action_plan = data.get('action_plan', '').strip()

    if not note_text:
        return jsonify({'error': 'Clinical note text is required'}), 400

    doctor_profile = current_user.doctor_profile
    doctor_id = doctor_profile.id if doctor_profile else current_user.id

    note = ClinicalNote(
        patient_id=patient.id,
        doctor_id=doctor_id,
        note_text=note_text,
        action_plan=action_plan
    )
    db.session.add(note)

    # Dispatch notification to patient and caregiver
    notif_msg = f"Dr. {current_user.full_name} entered a new clinical evaluation & action plan."
    notif = Notification(
        recipient_id=patient.id,
        patient_id=patient.id,
        severity='info',
        title='New Clinical Note Added',
        message=notif_msg,
        is_read=False
    )
    db.session.add(notif)

    if patient.assigned_caregiver and patient.assigned_caregiver.user:
        notif_care = Notification(
            recipient_id=patient.assigned_caregiver.user.id,
            patient_id=patient.id,
            severity='info',
            title=f"Clinical Care Update: {patient.user.full_name}",
            message=notif_msg,
            is_read=False
        )
        db.session.add(notif_care)

    db.session.commit()

    return jsonify({
        'message': 'Clinical note added successfully',
        'note': note.to_dict()
    }), 201

@doctor_bp.route('/patients/<int:patient_id>/notes', methods=['GET'])
@token_required()
def get_clinical_notes(current_user, patient_id):
    notes = ClinicalNote.query.filter_by(patient_id=patient_id).order_by(ClinicalNote.created_at.desc()).all()
    return jsonify({
        'patient_id': patient_id,
        'count': len(notes),
        'notes': [n.to_dict() for n in notes]
    })

@doctor_bp.route('/triage-summary', methods=['GET'])
@token_required()
def get_triage_summary(current_user):
    all_patients = Patient.query.all()
    
    critical_count = sum(1 for p in all_patients if p.monitoring_status == 'Critical Watch')
    review_count = sum(1 for p in all_patients if p.monitoring_status == 'Requires Review')
    stable_count = sum(1 for p in all_patients if p.monitoring_status in ['Stable', 'Active Monitoring'])

    # Active high-risk alerts in the last 24 hours
    unread_alerts = Notification.query.filter_by(is_read=False).count()

    return jsonify({
        'total_registered_patients': len(all_patients),
        'critical_watch': critical_count,
        'requires_review': review_count,
        'stable_monitoring': stable_count,
        'active_unread_alerts': unread_alerts
    })
