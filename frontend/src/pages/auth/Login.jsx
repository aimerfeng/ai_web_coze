import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export function Login() {
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
      await login(email, password);
      navigate('/jobs');
    } catch (err) {
      setError('登录失败，请检查您的凭据。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-primary-600 to-accent bg-clip-text text-transparent">
          欢迎回来
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="邮箱"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
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

          <div className="flex justify-end">
            <Link to="/forgot-password" class="text-sm text-primary-600 hover:text-primary-700">
              忘记密码？
            </Link>
          </div>

          <Button type="submit" className="w-full" isLoading={loading}>
            登录
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          还没有账号？{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
            立即注册
          </Link>
        </div>
      </Card>
    </div>
  );
}
