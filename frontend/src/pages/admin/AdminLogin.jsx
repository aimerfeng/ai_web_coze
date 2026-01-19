import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password, true); // true = isAdmin
      navigate('/admin/dashboard');
    } catch (err) {
      setError('管理员登录失败。请确认您有管理员权限。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            A
          </div>
          <h2 className="text-2xl font-bold text-slate-900">管理员登录</h2>
          <p className="text-slate-500 mt-2">仅限授权人员访问</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="管理员邮箱"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@example.com"
          />
          <Input
            label="密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
          
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" isLoading={loading}>
            进入后台
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-slate-500 hover:text-slate-900">
            返回求职者登录
          </Link>
        </div>
      </Card>
    </div>
  );
}
