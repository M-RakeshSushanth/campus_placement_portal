import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Briefcase,
  UserCheck,
  FileText,
  Sliders,
  LogOut,
  Bell,
  CheckCircle,
  Menu,
  X,
  Compass
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, student, logout, notifications, setNotifications } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'faculty';

  const navLinks = isAdminOrStaff
    ? [
        { name: 'Dashboard', path: '/admin/dashboard', icon: Briefcase },
        { name: 'Opportunities', path: '/admin/opportunities', icon: Compass },
        { name: 'Applications', path: '/admin/applications', icon: UserCheck },
        { name: 'Students', path: '/admin/students', icon: GraduationCap },
        { name: 'Settings & Rules', path: '/admin/settings', icon: Sliders }
      ]
    : [
        { name: 'Dashboard', path: '/student/dashboard', icon: Briefcase },
        { name: 'Opportunities', path: '/student/opportunities', icon: Compass },
        { name: 'My Applications', path: '/student/applications', icon: UserCheck },
        { name: 'Profile & Resume', path: '/student/profile', icon: FileText }
      ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-[#0F172A]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-[#0F172A] block leading-none">
                  CAMPUS<span className="text-[#2563EB]">PORTAL</span>
                </span>
                <span className="text-xs text-[#64748B] font-medium tracking-wide">Placement Automation Ecosystem</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#EFF6FF] text-[#2563EB]'
                        : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Header items */}
            <div className="flex items-center gap-3">
              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative p-2 text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-[#DC2626] rounded-full ring-2 ring-white animate-pulse" />
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-3 z-50">
                    <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                      <h4 className="font-semibold text-sm text-[#0F172A]">Real-Time Notifications</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] font-medium">
                        {unreadCount} unread
                      </span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-[#F1F5F9] mt-2">
                      {notifications.length === 0 ? (
                        <p className="text-center text-xs text-[#64748B] py-6">No placement alerts yet.</p>
                      ) : (
                        notifications.map((n, idx) => (
                          <div
                            key={n._id || idx}
                            onClick={() => markNotificationRead(n._id)}
                            className={`p-2.5 text-left rounded-lg transition-colors cursor-pointer ${
                              n.isRead ? 'opacity-70 hover:bg-[#F8FAFC]' : 'bg-[#EFF6FF]/60 hover:bg-[#EFF6FF]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-[#0F172A]">{n.title}</p>
                              {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]"></span>}
                            </div>
                            <p className="text-xs text-[#475569] mt-1">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Badge */}
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#E2E8F0]">
                <div className="text-right">
                  <p className="text-xs font-bold text-[#0F172A] leading-tight">
                    {student?.name || (user?.role === 'admin' ? 'Administrator' : 'Placement Cell')}
                  </p>
                  <p className="text-[11px] text-[#64748B] capitalize">{user?.role}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-[#EEF2FF] border border-[#CBD5E1] flex items-center justify-center font-bold text-xs text-[#4F46E5]">
                  {(student?.name || user?.role || 'U')[0].toUpperCase()}
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#475569] hover:bg-[#F1F5F9] rounded-lg"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#E2E8F0] px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#475569]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-[#64748B]">
          College Placement Portal &copy; 2026 • Verified Institutional Recruitment Management System
        </div>
      </footer>
    </div>
  );
}
