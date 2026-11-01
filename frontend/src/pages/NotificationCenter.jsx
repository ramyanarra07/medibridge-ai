import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCheck,
  Check,
  Filter
} from 'lucide-react';
import { api } from '../api/client';
import AlertBadge from '../components/AlertBadge';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'critical'
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications(false);
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      fetchNotifs();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await api.acknowledgeNotification(id);
      fetchNotifs();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'critical') return n.severity === 'critical';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Virtual Ward Notification Center</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-channel alerts triggered by physiological safety thresholds and risk escalations.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: `All Alerts (${notifications.length})` },
          { id: 'unread', label: `Unread (${notifications.filter(n => !n.is_read).length})` },
          { id: 'critical', label: `Critical Watch (${notifications.filter(n => n.severity === 'critical').length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map(n => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all shadow-sm ${
                !n.is_read
                  ? 'bg-white border-blue-200 ring-1 ring-blue-500/20'
                  : 'bg-slate-50/70 border-slate-200/80 text-slate-600'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{n.title}</span>
                  <AlertBadge severity={n.severity} label={n.severity} />
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" title="Unread" />
                  )}
                </div>
                <span className="text-[11px] text-slate-400">
                  {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-3">{n.message}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                <span className="text-slate-400">
                  {n.acknowledged_at ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Acknowledged at {new Date(n.acknowledged_at).toLocaleTimeString()}</span>
                    </span>
                  ) : (
                    'Pending acknowledgment'
                  )}
                </span>

                {!n.acknowledged_at && (
                  <button
                    onClick={() => handleAcknowledge(n.id)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Acknowledge</span>
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-semibold">No notifications match this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
