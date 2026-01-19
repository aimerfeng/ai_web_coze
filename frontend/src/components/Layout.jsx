import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { Briefcase, User, LogOut, Menu, X, Bell, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FluidBackground } from './FluidBackground';
import { useNotifications } from '../context/NotificationContext';
import { CompanyChat } from './CompanyChat';

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: '职位中心', path: '/jobs', icon: Briefcase },
    { label: '我的申请', path: '/dashboard', icon: User },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50/50">
      <FluidBackground />

      {/* Navbar - Glassmorphism */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-sm transition-all duration-300 hover:bg-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform">
                AI
              </div>
              <span className="font-bold text-slate-800 text-lg tracking-tight group-hover:text-primary-700 transition-colors">智能面试</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {user ? (
                <>
                  <div className="flex items-center gap-1 bg-white/30 rounded-full px-2 py-1 backdrop-blur-sm border border-white/40">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          location.pathname === item.path 
                            ? 'bg-white shadow-md text-primary-600 scale-105' 
                            : 'text-slate-600 hover:text-primary-600 hover:bg-white/50'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 relative">
                    {/* Notification Bell */}
                    <button 
                      className="relative p-2 text-slate-600 hover:bg-white/50 rounded-full transition-colors"
                      onClick={() => setShowNotifications(!showNotifications)}
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                      )}
                    </button>

                    {/* Notification Drawer */}
                    <AnimatePresence>
                      {showNotifications && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setShowNotifications(false)} 
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                          >
                            <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                              <h3 className="font-bold text-slate-900">通知中心</h3>
                              <span className="text-xs text-slate-500">{unreadCount} 未读</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                              {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm">
                                  暂无通知
                                </div>
                              ) : (
                                <div className="divide-y divide-slate-50">
                                  {notifications.map(n => (
                                    <div 
                                      key={n.id} 
                                      className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${n.is_read ? 'opacity-60' : 'bg-blue-50/30'}`}
                                      onClick={() => markAsRead(n.id)}
                                    >
                                      <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-sm font-medium text-slate-900">{n.title}</h4>
                                        <span className="text-[10px] text-slate-400">
                                          {new Date(n.created_at).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-600 line-clamp-2">{n.message}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>

                    <div className="relative">
                      <button
                        className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-white/30 px-3 py-1.5 rounded-lg border border-white/40 shadow-sm hover:bg-white/40 transition-colors"
                        onClick={() => setShowUserMenu((v) => !v)}
                      >
                        {user.name}
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      </button>

                      <AnimatePresence>
                        {showUserMenu && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.98 }}
                              className="absolute right-0 top-12 z-50 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden"
                            >
                              <Link
                                to="/profile"
                                className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <User className="w-4 h-4 text-slate-500" />
                                个人信息
                              </Link>
                              <button
                                onClick={() => { setShowUserMenu(false); handleLogout(); }}
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <LogOut className="w-4 h-4" />
                                退出登录
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="hover:bg-white/40">登录</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm" className="shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all">注册</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-slate-600 hover:bg-white/20 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden fixed top-16 left-0 right-0 z-40 bg-white shadow-xl border-b border-slate-100 p-4 flex flex-col gap-4"
        >
          {user ? (
            <>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-700"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-5 h-5" />
                个人信息
              </Link>
              <div className="h-px bg-slate-100 my-2" />
              <button 
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                退出登录
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="secondary" className="w-full">登录</Button>
              </Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                <Button variant="primary" className="w-full">注册</Button>
              </Link>
            </div>
          )}
        </motion.div>
      )}

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">
        {children}
      </main>
      {/* Global AI Chatbot */}
      <CompanyChat />
    </div>
  );
}
