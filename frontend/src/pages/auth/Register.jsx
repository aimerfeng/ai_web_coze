import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(email, password);
      navigate('/jobs');
    } catch (err) {
      setError('注册失败。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-primary-600 to-accent bg-clip-text text-transparent">
          创建账号
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
          <Input
            label="确认密码"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
          
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <Button type="submit" className="w-full" isLoading={loading}>
            注册
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          已有账号？{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
            登录
          </Link>
        </div>
      </Card>
    </div>
  );
}
