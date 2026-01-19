import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobProvider } from './context/JobContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { Layout } from './components/Layout';

// Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { JobBoard } from './pages/jobs/JobBoard';
import { JobDetail } from './pages/jobs/JobDetail';
import { ApplicationForm } from './pages/application/ApplicationForm';
import { Dashboard } from './pages/dashboard/Dashboard';
import { InterviewRoom } from './pages/interview/InterviewRoom';
import { Profile } from './pages/profile/Profile';
import { Button } from './components/ui/Button';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in space-y-8">
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          未来的 <span className="text-primary-600">智能招聘</span> 已来
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          体验下一代 AI 驱动的面试平台。公平、高效、互动。
        </p>
      </div>
      
      <div className="flex gap-4">
        <Link to="/jobs">
          <Button size="lg" className="shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 transform hover:-translate-y-1">
            查看在招职位
          </Button>
        </Link>
        <Link to="/register">
          <Button variant="secondary" size="lg">
            创建账号
          </Button>
        </Link>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <FeatureCard 
          title="AI 智能画像" 
          desc="智能分析您的简历和 GitHub 代码库，为您匹配最合适的职位。"
          delay={0.1}
        />
        <FeatureCard 
          title="实时 AI 面试" 
          desc="与我们的高级 AI 面试官进行互动式语音和视频面试。"
          delay={0.2}
        />
        <FeatureCard 
          title="即时反馈" 
          desc="比以往更快地获得您的申请状态通知。"
          delay={0.3}
        />
      </div>
    </div>
  );
}

function FeatureCard({ title, desc, delay }) {
  return (
    <div 
      className="p-6 bg-white/50 backdrop-blur border border-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
      style={{ animationDelay: `${delay}s` }}
    >
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{desc}</p>
    </div>
  );
}

import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminJobs } from './pages/admin/AdminJobs';
import { AdminJobCreate } from './pages/admin/AdminJobCreate';
import { AdminCandidates } from './pages/admin/AdminCandidates';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminSettings } from './pages/admin/AdminSettings';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/admin/login" />;
  return children;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <NotificationProvider>
          <JobProvider>
            <BrowserRouter>
              <Routes>
            {/* Public Routes */}
            <Route element={<Layout><Outlet /></Layout>}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              <Route path="/jobs" element={<JobBoard />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              
              <Route path="/apply/:id" element={
                <ProtectedRoute>
                  <ApplicationForm />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="/interview/:id" element={
                <ProtectedRoute>
                  <InterviewRoom />
                </ProtectedRoute>
              } />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="jobs" element={<AdminJobs />} />
              <Route path="jobs/new" element={<AdminJobCreate />} />
              <Route path="candidates" element={<AdminCandidates />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route index element={<Navigate to="dashboard" />} />
            </Route>
          </Routes>
            </BrowserRouter>
          </JobProvider>
        </NotificationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
