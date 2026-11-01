from flask import Blueprint, request, jsonify
from datetime import datetime
from backend.database.db import db
from backend.database.models import Notification
from backend.routes.auth_middleware import token_required

alert_bp = Blueprint('alerts', __name__, url_prefix='/api/notifications')

@alert_bp.route('', methods=['GET'])
@token_required()
def get_notifications(current_user):
    # Fetch notifications targeted to this user or related to virtual ward
    query = Notification.query.filter_by(recipient_id=current_user.id)

    # Filter unread if specified
    unread_only = request.args.get('unread', 'false').lower() == 'true'
    if unread_only:
        query = query.filter_by(is_read=False)

    notifications = query.order_by(Notification.created_at.desc()).limit(100).all()

    # If list is empty for demo, also fetch recent system notifications
    if not notifications and current_user.role in ['doctor', 'admin']:
        notifications = Notification.query.order_by(Notification.created_at.desc()).limit(20).all()

    return jsonify({
        'total': len(notifications),
        'notifications': [n.to_dict() for n in notifications]
    })

@alert_bp.route('/<int:notif_id>/read', methods=['PUT'])
@token_required()
def mark_notification_read(current_user, notif_id):
    notif = Notification.query.get_or_404(notif_id)
    notif.is_read = True
    db.session.commit()
    return jsonify({'message': 'Marked as read', 'notification': notif.to_dict()})

@alert_bp.route('/read-all', methods=['PUT'])
@token_required()
def mark_all_read(current_user):
    Notification.query.filter_by(recipient_id=current_user.id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'message': 'All notifications marked as read'})

@alert_bp.route('/<int:notif_id>/acknowledge', methods=['POST'])
@token_required()
def acknowledge_notification(current_user, notif_id):
    notif = Notification.query.get_or_404(notif_id)
    notif.is_read = True
    notif.acknowledged_by = current_user.id
    notif.acknowledged_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Alert acknowledged', 'notification': notif.to_dict()})
