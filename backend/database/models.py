import json
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from backend.database.db import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='patient') # 'patient', 'doctor', 'caregiver', 'admin'
    full_name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(30), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    patient_profile = db.relationship('Patient', backref='user', uselist=False, foreign_keys='Patient.id', cascade='all, delete-orphan')
    doctor_profile = db.relationship('Doctor', backref='user', uselist=False, foreign_keys='Doctor.id', cascade='all, delete-orphan')
    caregiver_profile = db.relationship('Caregiver', backref='user', uselist=False, foreign_keys='Caregiver.id', cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='recipient', foreign_keys='Notification.recipient_id', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'full_name': self.full_name,
            'phone': self.phone,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Doctor(db.Model):
    __tablename__ = 'doctors'
    
    id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    specialization = db.Column(db.String(120), nullable=False, default='General Internal Medicine')
    license_number = db.Column(db.String(50), nullable=False, default='MD-VWARD-001')
    department = db.Column(db.String(100), default='Chronic Disease Virtual Ward')
    hospital_affiliation = db.Column(db.String(150), default='Medi Bridge Academic Medical Center')
    consultation_hours = db.Column(db.String(100), default='09:00 - 17:00 EST')

    # Relationships
    assigned_patients = db.relationship('Patient', backref='assigned_doctor', foreign_keys='Patient.assigned_doctor_id')
    clinical_notes = db.relationship('ClinicalNote', backref='author_doctor', foreign_keys='ClinicalNote.doctor_id')

    def to_dict(self):
        user_info = self.user.to_dict() if self.user else {}
        return {
            **user_info,
            'doctor_id': self.id,
            'specialization': self.specialization,
            'license_number': self.license_number,
            'department': self.department,
            'hospital_affiliation': self.hospital_affiliation,
            'consultation_hours': self.consultation_hours,
            'patient_count': len(self.assigned_patients)
        }


class Caregiver(db.Model):
    __tablename__ = 'caregivers'
    
    id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    relationship_to_patient = db.Column(db.String(80), default='Family Member')
    preferred_contact_method = db.Column(db.String(50), default='In-App & Email')

    # Relationships
    assigned_patients = db.relationship('Patient', backref='assigned_caregiver', foreign_keys='Patient.assigned_caregiver_id')

    def to_dict(self):
        user_info = self.user.to_dict() if self.user else {}
        return {
            **user_info,
            'caregiver_id': self.id,
            'relationship_to_patient': self.relationship_to_patient,
            'preferred_contact_method': self.preferred_contact_method,
            'patient_count': len(self.assigned_patients)
        }


class Patient(db.Model):
    __tablename__ = 'patients'
    
    id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    date_of_birth = db.Column(db.String(20), nullable=True) # YYYY-MM-DD
    gender = db.Column(db.String(20), default='Not Specified')
    blood_group = db.Column(db.String(10), default='O+')
    emergency_contact = db.Column(db.String(100), default='Not Provided')
    ward_bed_no = db.Column(db.String(50), default='VW-Room-101')
    monitoring_status = db.Column(db.String(30), default='Active Monitoring') # 'Active Monitoring', 'Requires Review', 'Critical Watch', 'Stable'
    medical_history_summary = db.Column(db.Text, default='Type-2 Diabetes history, Hypertension stage 1')
    
    assigned_doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=True)
    assigned_caregiver_id = db.Column(db.Integer, db.ForeignKey('caregivers.id'), nullable=True)

    # Relationships
    health_records = db.relationship('HealthRecord', backref='patient', cascade='all, delete-orphan', order_by='desc(HealthRecord.recorded_at)')
    disease_predictions = db.relationship('DiseasePrediction', backref='patient', cascade='all, delete-orphan', order_by='desc(DiseasePrediction.created_at)')
    clinical_notes = db.relationship('ClinicalNote', backref='patient', cascade='all, delete-orphan', order_by='desc(ClinicalNote.created_at)')
    notifications = db.relationship('Notification', backref='patient', foreign_keys='Notification.patient_id', cascade='all, delete-orphan')

    def to_dict(self, include_doctor_caregiver=True):
        user_info = self.user.to_dict() if self.user else {}
        latest_record = self.health_records[0].to_dict() if self.health_records else None
        
        doctor_name = self.assigned_doctor.user.full_name if (self.assigned_doctor and self.assigned_doctor.user) else "Unassigned"
        caregiver_name = self.assigned_caregiver.user.full_name if (self.assigned_caregiver and self.assigned_caregiver.user) else "Unassigned"

        return {
            **user_info,
            'patient_id': self.id,
            'date_of_birth': self.date_of_birth,
            'gender': self.gender,
            'blood_group': self.blood_group,
            'emergency_contact': self.emergency_contact,
            'ward_bed_no': self.ward_bed_no,
            'monitoring_status': self.monitoring_status,
            'medical_history_summary': self.medical_history_summary,
            'assigned_doctor_id': self.assigned_doctor_id,
            'assigned_doctor_name': doctor_name,
            'assigned_caregiver_id': self.assigned_caregiver_id,
            'assigned_caregiver_name': caregiver_name,
            'latest_vitals': latest_record,
            'total_records': len(self.health_records)
        }


class HealthRecord(db.Model):
    __tablename__ = 'health_records'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id', ondelete='CASCADE'), nullable=False, index=True)
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Blood Pressure & Hemodynamics
    systolic_bp = db.Column(db.Float, nullable=False, default=120.0)    # mmHg
    diastolic_bp = db.Column(db.Float, nullable=False, default=80.0)     # mmHg
    heart_rate = db.Column(db.Float, nullable=False, default=72.0)       # bpm
    
    # Glycemic & Metabolic
    blood_glucose = db.Column(db.Float, nullable=False, default=100.0)   # mg/dL
    hba1c = db.Column(db.Float, nullable=True, default=5.6)              # %
    bmi = db.Column(db.Float, nullable=False, default=24.5)              # kg/m^2
    
    # Renal / Kidney
    serum_creatinine = db.Column(db.Float, nullable=True, default=0.9)   # mg/dL
    blood_urea = db.Column(db.Float, nullable=True, default=25.0)        # mg/dL
    egfr = db.Column(db.Float, nullable=True, default=95.0)              # mL/min/1.73m2
    albumin = db.Column(db.Float, nullable=True, default=4.2)           # g/dL
    hemoglobin = db.Column(db.Float, nullable=True, default=14.0)        # g/dL
    
    # Cardiovascular & Lipid
    total_cholesterol = db.Column(db.Float, nullable=True, default=180.0)# mg/dL
    exercise_induced_angina = db.Column(db.Boolean, default=False)
    
    # Context
    symptoms = db.Column(db.String(255), default='None reported')
    notes = db.Column(db.Text, nullable=True)

    # Predictions associated with this record
    predictions = db.relationship('DiseasePrediction', backref='health_record', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'recorded_at': self.recorded_at.isoformat() if self.recorded_at else None,
            'systolic_bp': self.systolic_bp,
            'diastolic_bp': self.diastolic_bp,
            'heart_rate': self.heart_rate,
            'blood_glucose': self.blood_glucose,
            'hba1c': self.hba1c,
            'bmi': self.bmi,
            'serum_creatinine': self.serum_creatinine,
            'blood_urea': self.blood_urea,
            'egfr': self.egfr,
            'albumin': self.albumin,
            'hemoglobin': self.hemoglobin,
            'total_cholesterol': self.total_cholesterol,
            'exercise_induced_angina': self.exercise_induced_angina,
            'symptoms': self.symptoms,
            'notes': self.notes
        }


class DiseasePrediction(db.Model):
    __tablename__ = 'disease_predictions'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id', ondelete='CASCADE'), nullable=False, index=True)
    record_id = db.Column(db.Integer, db.ForeignKey('health_records.id', ondelete='CASCADE'), nullable=True)
    
    # 'diabetes', 'ckd', 'hypertension', 'cardiovascular'
    condition_type = db.Column(db.String(40), nullable=False, index=True)
    risk_score = db.Column(db.Float, nullable=False) # 0.0 to 1.0 (calibrated risk probability)
    risk_level = db.Column(db.String(20), nullable=False) # 'Low', 'Moderate', 'High', 'Critical'
    prediction_label = db.Column(db.String(80), nullable=False)
    
    # Explainable AI JSON string & summary
    top_contributing_factors = db.Column(db.Text, default='[]') # JSON serialized list of {feature, contribution, value, impact}
    explainability_summary = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        factors = []
        if self.top_contributing_factors:
            try:
                factors = json.loads(self.top_contributing_factors)
            except Exception:
                factors = []
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'record_id': self.record_id,
            'condition_type': self.condition_type,
            'risk_score': round(self.risk_score, 4),
            'risk_percentage': round(self.risk_score * 100, 1),
            'risk_level': self.risk_level,
            'prediction_label': self.prediction_label,
            'top_contributing_factors': factors,
            'explainability_summary': self.explainability_summary,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id', ondelete='CASCADE'), nullable=True)
    
    severity = db.Column(db.String(20), default='info') # 'info', 'warning', 'critical'
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    
    # Caregiver or Doctor acknowledgment
    acknowledged_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    acknowledged_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            'id': self.id,
            'recipient_id': self.recipient_id,
            'patient_id': self.patient_id,
            'patient_name': self.patient.user.full_name if (self.patient and self.patient.user) else None,
            'severity': self.severity,
            'title': self.title,
            'message': self.message,
            'is_read': self.is_read,
            'acknowledged_by': self.acknowledged_by,
            'acknowledged_at': self.acknowledged_at.isoformat() if self.acknowledged_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class ClinicalNote(db.Model):
    __tablename__ = 'clinical_notes'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id', ondelete='CASCADE'), nullable=False, index=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    
    note_text = db.Column(db.Text, nullable=False)
    action_plan = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        doctor_name = self.author_doctor.user.full_name if (self.author_doctor and self.author_doctor.user) else "Doctor"
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'doctor_id': self.doctor_id,
            'doctor_name': doctor_name,
            'note_text': self.note_text,
            'action_plan': self.action_plan,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
