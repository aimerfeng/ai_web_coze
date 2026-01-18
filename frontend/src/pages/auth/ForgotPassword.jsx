import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { ArrowLeft } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回登录
        </Link>
        
        <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary-600 to-accent bg-clip-text text-transparent">
          重置密码
        </h2>
        <p className="text-center text-slate-500 mb-6">
          请输入您的邮箱地址，我们将向您发送重置密码的链接。
        </p>

        {success ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center">
            如果账号 {email} 存在，您将很快收到密码重置链接。
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="邮箱"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
            
            <Button type="submit" className="w-full" isLoading={loading}>
              发送重置链接
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
