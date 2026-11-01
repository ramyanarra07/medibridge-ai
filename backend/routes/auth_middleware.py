import jwt
from functools import wraps
from flask import request, jsonify, current_app
from backend.database.models import User

def token_required(allowed_roles=None):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            auth_header = request.headers.get('Authorization')
            
            if auth_header:
                parts = auth_header.split()
                if len(parts) == 2 and parts[0].lower() == 'bearer':
                    token = parts[1]
                elif len(parts) == 1:
                    token = parts[0]

            if not token:
                return jsonify({'error': 'Authentication token is missing'}), 401

            try:
                # Decode JWT
                data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
                current_user = User.query.get(data['user_id'])
                if not current_user:
                    return jsonify({'error': 'User associated with token not found'}), 401
                
                # Check role if required
                if allowed_roles and current_user.role not in allowed_roles:
                    return jsonify({'error': f'Unauthorized access for role {current_user.role}'}), 403

            except jwt.ExpiredSignatureError:
                return jsonify({'error': 'Authentication token has expired. Please log in again.'}), 401
            except Exception as e:
                return jsonify({'error': f'Invalid token: {str(e)}'}), 401

            return f(current_user, *args, **kwargs)
        return decorated
    return decorator
