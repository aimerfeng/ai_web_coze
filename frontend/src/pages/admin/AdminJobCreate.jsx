import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminJobCreate() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: '全职',
    salary_range: '',
    description: '',
    requirements: '',
    knowledge_base: '',
    public_knowledge: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        navigate('/admin/jobs');
      } else {
        alert('发布失败，请重试');
      }
    } catch (error) {
      console.error(error);
      alert('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up pb-20">
      <div className="flex items-center gap-4">
        <Link to="/admin/jobs">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">发布新职位</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">基本信息</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="职位名称"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
              placeholder="例如：高级 Python 工程师"
            />
            <Input
              label="部门"
              value={formData.department}
              onChange={e => setFormData({...formData, department: e.target.value})}
              required
              placeholder="例如：研发部"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">职位类型</label>
              <select
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
              >
                <option value="全职">全职</option>
                <option value="兼职">兼职</option>
                <option value="外包">外包</option>
                <option value="实习">实习</option>
              </select>
            </div>
            <Input
              label="工作地点"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
              required
              placeholder="例如：北京 / 远程"
            />
            <Input
              label="薪资范围"
              value={formData.salary_range}
              onChange={e => setFormData({...formData, salary_range: e.target.value})}
              required
              placeholder="例如：20k-40k"
            />
          </div>
        </Card>

        <Card className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">职位详情</h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">职位描述 (JD)</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              required
              rows={5}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
              placeholder="请详细描述工作职责..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">任职要求</label>
            <textarea
              value={formData.requirements}
              onChange={e => setFormData({...formData, requirements: e.target.value})}
              required
              rows={5}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
              placeholder="请列出技能要求，每行一条..."
            />
          </div>
        </Card>

        <Card className="space-y-6 bg-blue-50/30 border-blue-100">
          <h2 className="text-lg font-semibold text-primary-900 border-b border-primary-100 pb-2">AI 知识库配置</h2>
          <p className="text-sm text-slate-500 -mt-4">这些信息将用于增强 AI 面试官和职位助手的回答能力。</p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">内部知识库 (仅 AI 可见)</label>
            <textarea
              value={formData.knowledge_base}
              onChange={e => setFormData({...formData, knowledge_base: e.target.value})}
              rows={4}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
              placeholder="例如：技术栈详情、团队内部流程、面试考察重点..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">公开知识库 (候选人可见)</label>
            <textarea
              value={formData.public_knowledge}
              onChange={e => setFormData({...formData, public_knowledge: e.target.value})}
              rows={3}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
              placeholder="例如：公司福利、团队文化、晋升机制..."
            />
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/jobs')}>
            取消
          </Button>
          <Button type="submit" isLoading={loading}>
            <Save className="w-4 h-4 mr-2" />
            发布职位
          </Button>
        </div>
      </form>
    </div>
  );
}
