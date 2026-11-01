import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Bell, LogOut, User as UserIcon, Shield, Stethoscope, HeartHandshake } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await api.getNotifications(true);
        setUnreadCount(res.total || 0);
      } catch (e) {
        // quiet error on unauthenticated/offline
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'doctor': return Stethoscope;
      case 'caregiver': return HeartHandshake;
      case 'admin': return Shield;
      default: return Activity;
    }
  };

  const RoleIcon = getRoleIcon(user?.role);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-800 flex items-center gap-1">
              Medi Bridge <span className="text-blue-600 font-extrabold text-xs px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">AI</span>
            </span>
            <span className="text-[10px] block -mt-1 font-semibold text-slate-400 uppercase tracking-widest">
              Adaptive Virtual Wards
            </span>
          </div>
        </Link>

        {/* User Navigation Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Role Indicator Pill */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                <RoleIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>{user.role}</span>
              </div>

              {/* Notification Bell */}
              <Link
                to="/notifications"
                className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown / Info */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-slate-800">{user.full_name}</div>
                  <div className="text-[11px] text-slate-400">{user.email}</div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
