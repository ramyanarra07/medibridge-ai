"""
Medi Bridge AI - Adaptive Monitoring & Triage Engine
Continuously assesses incoming longitudinal telemetry, evaluates physiological deltas,
recalculates multi-disease risks, monitors clinical safety thresholds,
and triggers multi-role notifications.
"""

from datetime import datetime
from backend.database.db import db
from backend.database.models import (
    HealthRecord, DiseasePrediction, Notification, Patient, Doctor, Caregiver, User
)
from backend.services.explainable_ai import explain_prediction

# Safety Threshold Definitions (Clinical Reference Standards)
CRITICAL_THRESHOLDS = {
    'systolic_high': 180.0,
    'systolic_low': 85.0,
    'diastolic_high': 115.0,
    'diastolic_low': 50.0,
    'glucose_high': 260.0,
    'glucose_low': 60.0,
    'creatinine_high': 2.5,
    'egfr_low': 30.0,
    'heart_rate_high': 125.0,
    'heart_rate_low': 45.0,
    'cholesterol_high': 260.0
}

WARNING_THRESHOLDS = {
    'systolic_high': 140.0,
    'diastolic_high': 90.0,
    'glucose_high': 160.0,
    'creatinine_high': 1.5,
    'egfr_low': 60.0,
    'heart_rate_high': 100.0,
    'cholesterol_high': 220.0
}

def analyze_and_adapt(patient_id, new_record_id, ml_service):
    """
    Main orchestration pipeline called upon new health record ingestion.
    """
    patient = Patient.query.get(patient_id)
    if not patient:
        return None

    current_record = HealthRecord.query.get(new_record_id)
    if not current_record:
        return None

    # 1. Fetch previous record for longitudinal delta analysis
    previous_record = (
        HealthRecord.query
        .filter(HealthRecord.patient_id == patient_id, HealthRecord.id != new_record_id)
        .order_by(HealthRecord.recorded_at.desc())
        .first()
    )

    deltas = {}
    if previous_record:
        deltas = {
            'systolic_bp': round(current_record.systolic_bp - previous_record.systolic_bp, 1),
            'diastolic_bp': round(current_record.diastolic_bp - previous_record.diastolic_bp, 1),
            'heart_rate': round(current_record.heart_rate - previous_record.heart_rate, 1),
            'blood_glucose': round(current_record.blood_glucose - previous_record.blood_glucose, 1),
            'serum_creatinine': round((current_record.serum_creatinine or 0) - (previous_record.serum_creatinine or 0), 2),
            'bmi': round(current_record.bmi - previous_record.bmi, 1)
        }

    # 2. Extract patient age for inference
    age = 50
    if patient.date_of_birth:
        try:
            birth_year = int(patient.date_of_birth.split('-')[0])
            age = max(18, datetime.utcnow().year - birth_year)
        except Exception:
            age = 50

    vitals_dict = current_record.to_dict()
    vitals_dict['age'] = age

    # 3. Perform ML Predictions across all 4 chronic conditions
    predictions = ml_service.predict_all_conditions(vitals_dict)

    # 4. Save DiseasePrediction entries to database
    prediction_objects = []
    import json
    for p in predictions:
        pred_obj = DiseasePrediction(
            patient_id=patient_id,
            record_id=current_record.id,
            condition_type=p['condition_type'],
            risk_score=p['risk_score'],
            risk_level=p['risk_level'],
            prediction_label=p['prediction_label'],
            top_contributing_factors=json.dumps(p['top_contributing_factors']),
            explainability_summary=p['explainability_summary']
        )
        db.session.add(pred_obj)
        prediction_objects.append(pred_obj)

    # 5. Check Thresholds and Escalations
    highest_severity = 'info'
    alert_messages = []

    # Check Critical Red-Lines
    if current_record.systolic_bp >= CRITICAL_THRESHOLDS['systolic_high']:
        highest_severity = 'critical'
        alert_messages.append(f"Hypertensive Crisis alert: Systolic BP {current_record.systolic_bp} mmHg exceeds critical 180 mmHg limit.")
    elif current_record.systolic_bp <= CRITICAL_THRESHOLDS['systolic_low']:
        highest_severity = 'critical'
        alert_messages.append(f"Hypotensive alert: Systolic BP {current_record.systolic_bp} mmHg dropped below 85 mmHg.")

    if current_record.blood_glucose >= CRITICAL_THRESHOLDS['glucose_high']:
        highest_severity = 'critical'
        alert_messages.append(f"Hyperglycemic Crisis: Blood glucose {current_record.blood_glucose} mg/dL requires urgent insulin review.")
    elif current_record.blood_glucose <= CRITICAL_THRESHOLDS['glucose_low']:
        highest_severity = 'critical'
        alert_messages.append(f"Hypoglycemia Danger: Blood glucose {current_record.blood_glucose} mg/dL below safe threshold (60 mg/dL).")

    if current_record.serum_creatinine and current_record.serum_creatinine >= CRITICAL_THRESHOLDS['creatinine_high']:
        highest_severity = 'critical'
        alert_messages.append(f"Renal Alarm: Serum creatinine {current_record.serum_creatinine} mg/dL indicates severe acute or chronic deterioration.")

    # Check Warning Thresholds if not already critical
    if highest_severity != 'critical':
        if current_record.systolic_bp >= WARNING_THRESHOLDS['systolic_high']:
            highest_severity = 'warning'
            alert_messages.append(f"Elevated Blood Pressure: Systolic BP {current_record.systolic_bp} mmHg exceeds 140 mmHg.")
        if current_record.blood_glucose >= WARNING_THRESHOLDS['glucose_high']:
            highest_severity = 'warning'
            alert_messages.append(f"Elevated Blood Glucose: {current_record.blood_glucose} mg/dL is higher than target.")
        if current_record.serum_creatinine and current_record.serum_creatinine >= WARNING_THRESHOLDS['creatinine_high']:
            highest_severity = 'warning'
            alert_messages.append(f"Renal filtration warning: Creatinine {current_record.serum_creatinine} mg/dL is elevated.")

    # Check if ML predicts High / Critical risk
    any_high_ml = any(p['risk_level'] in ['High', 'Critical'] for p in predictions)
    if any_high_ml and highest_severity == 'info':
        highest_severity = 'warning'
        alert_messages.append("Multi-condition AI models indicate an escalated risk trajectory.")

    # 6. Adapt Patient Monitoring Status in Virtual Ward
    if highest_severity == 'critical':
        patient.monitoring_status = 'Critical Watch'
    elif highest_severity == 'warning':
        patient.monitoring_status = 'Requires Review'
    else:
        patient.monitoring_status = 'Stable'

    # 7. Dispatch Role-Based Notifications
    patient_user = patient.user
    patient_name = patient_user.full_name if patient_user else "Patient"

    if alert_messages:
        consolidated_msg = " | ".join(alert_messages)

        # Notify Doctor
        if patient.assigned_doctor_id:
            doctor = Doctor.query.get(patient.assigned_doctor_id)
            if doctor and doctor.user:
                notif_doc = Notification(
                    recipient_id=doctor.user.id,
                    patient_id=patient.id,
                    severity=highest_severity,
                    title=f"Virtual Ward Alert: {patient_name} [{patient.monitoring_status}]",
                    message=f"Telemetry update for {patient_name} in {patient.ward_bed_no}: {consolidated_msg}",
                    is_read=False
                )
                db.session.add(notif_doc)

        # Notify Caregiver
        if patient.assigned_caregiver_id:
            caregiver = Caregiver.query.get(patient.assigned_caregiver_id)
            if caregiver and caregiver.user:
                notif_care = Notification(
                    recipient_id=caregiver.user.id,
                    patient_id=patient.id,
                    severity=highest_severity,
                    title=f"Attention Required: {patient_name}",
                    message=f"Important health alert for {patient_name}: {consolidated_msg}. Please check in on them.",
                    is_read=False
                )
                db.session.add(notif_care)

        # Notify Patient
        notif_patient = Notification(
            recipient_id=patient.id,
            patient_id=patient.id,
            severity=highest_severity,
            title=f"Health Update: {highest_severity.upper()} Notice",
            message=f"We analyzed your latest vitals: {consolidated_msg} Your care team has been alerted.",
            is_read=False
        )
        db.session.add(notif_patient)

    db.session.commit()

    return {
        'status': 'success',
        'record_id': current_record.id,
        'patient_id': patient.id,
        'monitoring_status': patient.monitoring_status,
        'deltas': deltas,
        'predictions': [p.to_dict() for p in prediction_objects],
        'alerts_generated': len(alert_messages),
        'severity': highest_severity,
        'alert_details': alert_messages
    }
