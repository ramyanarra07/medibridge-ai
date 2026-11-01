"""
Medi Bridge AI - Clinical Report Generation Service
Generates structured health summary reports and printable HTML/PDF-ready documents
for patients, attending physicians, and caregivers.
"""

from datetime import datetime
from backend.database.models import Patient, HealthRecord, DiseasePrediction, ClinicalNote, Doctor

def generate_patient_health_report(patient_id):
    patient = Patient.query.get(patient_id)
    if not patient:
        return None

    # Demographics
    user = patient.user
    doc = patient.assigned_doctor.user if (patient.assigned_doctor and patient.assigned_doctor.user) else None
    care = patient.assigned_caregiver.user if (patient.assigned_caregiver and patient.assigned_caregiver.user) else None

    # Vitals history
    records = HealthRecord.query.filter_by(patient_id=patient_id).order_by(HealthRecord.recorded_at.desc()).limit(15).all()
    latest_record = records[0] if records else None

    # Compute averages if multiple records exist
    stats = {}
    if records:
        n = len(records)
        stats = {
            'avg_systolic': round(sum(r.systolic_bp for r in records) / n, 1),
            'avg_diastolic': round(sum(r.diastolic_bp for r in records) / n, 1),
            'avg_glucose': round(sum(r.blood_glucose for r in records) / n, 1),
            'avg_heart_rate': round(sum(r.heart_rate for r in records) / n, 1),
            'total_logs': n
        }

    # Latest Predictions
    preds = DiseasePrediction.query.filter_by(patient_id=patient_id).order_by(DiseasePrediction.created_at.desc()).limit(4).all()

    # Clinical Notes
    notes = ClinicalNote.query.filter_by(patient_id=patient_id).order_by(ClinicalNote.created_at.desc()).limit(5).all()

    report_data = {
        'generated_at': datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        'patient_info': {
            'full_name': user.full_name if user else "Unknown Patient",
            'email': user.email if user else "N/A",
            'phone': user.phone if user else "N/A",
            'date_of_birth': patient.date_of_birth,
            'gender': patient.gender,
            'blood_group': patient.blood_group,
            'ward_bed_no': patient.ward_bed_no,
            'monitoring_status': patient.monitoring_status,
            'medical_history': patient.medical_history_summary,
            'attending_physician': doc.full_name if doc else "Unassigned",
            'caregiver_contact': care.full_name if care else "Unassigned"
        },
        'vitals_summary': {
            'latest': latest_record.to_dict() if latest_record else None,
            'averages': stats,
            'records_history': [r.to_dict() for r in records]
        },
        'ai_risk_assessment': [p.to_dict() for p in preds],
        'clinical_notes': [n.to_dict() for n in notes],
        'disclaimer': (
            "DISCLAIMER: Medi Bridge AI is an academic research prototype designed for demonstration "
            "and remote longitudinal tracking. The risk scores and automated explanations are educational "
            "decision-support aids and do NOT replace formal medical judgment or laboratory diagnostic tests."
        )
    }

    return report_data
