import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { Briefcase, User, LogOut, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { FluidBackground } from './FluidBackground';

export function Layout({ children }) {
  const { user, logout } = useAuth();
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
                  
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-700 bg-white/30 px-3 py-1.5 rounded-lg border border-white/40 shadow-sm">
                      {user.name}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleLogout}
                      className="hover:bg-red-50 hover:text-red-600 rounded-full w-9 h-9 p-0 flex items-center justify-center transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
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
    </div>
  );
}
