import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { Check, X, ShieldCheck } from 'lucide-react';

export function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    code: ''
  });
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Password Strength
  const checkStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };
  const strength = checkStrength(formData.password);

  // Timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleSendCode = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      addToast('请输入有效的邮箱地址', 'warning');
      return;
    }
    
    setCountdown(60);
    try {
      const res = await fetch(`${API_URL}/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      if (res.ok) {
        setCodeSent(true);
        addToast('验证码已发送 (测试码: 123456)', 'success');
      } else {
        addToast('发送失败，请重试', 'error');
        setCountdown(0);
      }
    } catch (e) {
      addToast('网络错误', 'error');
      setCountdown(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (strength < 2) {
      addToast('密码强度太低，请使用更复杂的密码', 'warning');
      return;
    }
    
    setLoading(true);
    try {
      // Pass code to register function
      await register(formData.full_name, formData.email, formData.password, formData.code);
      addToast('注册成功！正在跳转...', 'success');
      navigate('/jobs');
    } catch (err) {
      addToast(err.message || '注册失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <Card className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">创建账号</h2>
          <p className="mt-2 text-slate-600">开启您的智能求职之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="全名"
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            required
            placeholder="张三"
          />
          
          <Input
            label="电子邮箱"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            placeholder="name@example.com"
          />

          {/* Verification Code */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="验证码"
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                required
                placeholder="123456"
              />
            </div>
            <Button 
              type="button" 
              variant="secondary" 
              className="mb-[2px]"
              onClick={handleSendCode}
              disabled={countdown > 0}
            >
              {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
            </Button>
          </div>

          <div>
            <Input
              label="密码"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              placeholder="••••••••"
            />
            {/* Password Strength Meter */}
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1 h-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`flex-1 rounded-full transition-colors ${
                      strength >= i 
                        ? (strength < 2 ? 'bg-red-500' : strength < 3 ? 'bg-yellow-500' : 'bg-green-500') 
                        : 'bg-slate-200'
                    }`} />
                  ))}
                </div>
                <p className={`text-xs text-right ${
                  strength < 2 ? 'text-red-500' : strength < 3 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {strength < 2 ? '太弱' : strength < 3 ? '中等' : '强'}
                </p>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">至少8位，建议包含大写字母、数字和符号。</p>
          </div>

          <Button type="submit" className="w-full shadow-lg shadow-primary-500/30" isLoading={loading}>
            立即注册
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            已有账号？{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              直接登录
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
