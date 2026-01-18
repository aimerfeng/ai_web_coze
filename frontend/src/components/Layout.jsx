import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogOut, User, Briefcase, Menu, X } from 'lucide-react';
import { Button } from './ui/Button';

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: '职位中心', path: '/jobs', icon: Briefcase },
    { label: '我的申请', path: '/dashboard', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-3xl" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                AI
              </div>
              <span className="font-bold text-slate-800 text-lg tracking-tight">智能面试</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {user ? (
                <>
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                        location.pathname === item.path 
                          ? 'text-primary-600' 
                          : 'text-slate-600 hover:text-primary-600'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  ))}
                  <div className="h-6 w-px bg-slate-200" />
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700">{user.name}</span>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">登录</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">注册</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-slate-600"
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
