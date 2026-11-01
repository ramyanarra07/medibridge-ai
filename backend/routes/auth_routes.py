from datetime import datetime, timedelta
import jwt
from flask import Blueprint, request, jsonify, current_app
from backend.database.db import db
from backend.database.models import User, Patient, Doctor, Caregiver
from backend.routes.auth_middleware import token_required

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    
    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()
    role = data.get('role', 'patient').strip().lower()
    phone = data.get('phone', '')

    if not username or not email or not password or not full_name:
        return jsonify({'error': 'Username, email, password, and full name are required'}), 400

    if role not in ['patient', 'doctor', 'caregiver', 'admin']:
        return jsonify({'error': 'Invalid role specified'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 409

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    user = User(
        username=username,
        email=email,
        role=role,
        full_name=full_name,
        phone=phone
    )
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    # Create associated role profile
    if role == 'patient':
        patient = Patient(
            id=user.id,
            date_of_birth=data.get('date_of_birth', '1980-01-01'),
            gender=data.get('gender', 'Not Specified'),
            blood_group=data.get('blood_group', 'O+'),
            emergency_contact=data.get('emergency_contact', 'Not Specified'),
            ward_bed_no=data.get('ward_bed_no', f'VW-Bed-{user.id + 100}'),
            monitoring_status='Active Monitoring',
            medical_history_summary=data.get('medical_history', 'Newly registered patient.')
        )
        db.session.add(patient)

    elif role == 'doctor':
        doctor = Doctor(
            id=user.id,
            specialization=data.get('specialization', 'Internal Medicine & Chronic Care'),
            license_number=data.get('license_number', f'MD-VW-{user.id + 500}'),
            department=data.get('department', 'Virtual Chronic Ward'),
            hospital_affiliation=data.get('hospital_affiliation', 'Medi Bridge Academic Center')
        )
        db.session.add(doctor)

    elif role == 'caregiver':
        caregiver = Caregiver(
            id=user.id,
            relationship_to_patient=data.get('relationship', 'Primary Caregiver'),
            preferred_contact_method=data.get('contact_method', 'In-App Alerts')
        )
        db.session.add(caregiver)

    db.session.commit()

    # Generate JWT Token
    token = jwt.encode({
        'user_id': user.id,
        'username': user.username,
        'role': user.role,
        'exp': datetime.utcnow() + timedelta(days=7)
    }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')

    return jsonify({
        'message': 'Registration successful',
        'token': token,
        'user': user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    identifier = data.get('username', '').strip()
    password = data.get('password', '')

    if not identifier or not password:
        return jsonify({'error': 'Username/email and password are required'}), 400

    # Match by username or email
    user = User.query.filter(
        (User.username == identifier) | (User.email == identifier.lower())
    ).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials. Please verify username and password.'}), 401

    token = jwt.encode({
        'user_id': user.id,
        'username': user.username,
        'role': user.role,
        'exp': datetime.utcnow() + timedelta(days=7)
    }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')

    profile_data = user.to_dict()
    if user.role == 'patient' and user.patient_profile:
        profile_data['patient_details'] = user.patient_profile.to_dict()
    elif user.role == 'doctor' and user.doctor_profile:
        profile_data['doctor_details'] = user.doctor_profile.to_dict()
    elif user.role == 'caregiver' and user.caregiver_profile:
        profile_data['caregiver_details'] = user.caregiver_profile.to_dict()

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': profile_data
    }), 200


@auth_bp.route('/me', methods=['GET'])
@token_required()
def get_current_user(current_user):
    profile_data = current_user.to_dict()
    if current_user.role == 'patient' and current_user.patient_profile:
        profile_data['patient_details'] = current_user.patient_profile.to_dict()
    elif current_user.role == 'doctor' and current_user.doctor_profile:
        profile_data['doctor_details'] = current_user.doctor_profile.to_dict()
    elif current_user.role == 'caregiver' and current_user.caregiver_profile:
        profile_data['caregiver_details'] = current_user.caregiver_profile.to_dict()

    return jsonify({'user': profile_data})


@auth_bp.route('/users', methods=['GET'])
@token_required(allowed_roles=['admin', 'doctor'])
def list_users(current_user):
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({'users': [u.to_dict() for u in users]})
