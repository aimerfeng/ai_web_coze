import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Bell, Shield, Users, Save, ToggleLeft, ToggleRight } from 'lucide-react';

export function AdminSettings() {
  const [notifications, setNotifications] = useState({
    email: true,
    feishu: false,
    interviewReminder: true
  });

  const [aiConfig, setAiConfig] = useState({
    passThreshold: 80,
    autoReject: false,
    model: 'GPT-4o'
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">系统设置</h1>
        <p className="text-slate-500">配置招聘流程、通知及 AI 参数</p>
      </div>

      {/* Notification Settings */}
      <Card className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <Bell className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-slate-900">通知配置</h2>
        </div>
        
        <div className="space-y-4">
          <ToggleItem 
            label="新申请邮件通知" 
            desc="当有候选人提交申请时，发送邮件给 HR。"
            checked={notifications.email}
            onChange={() => setNotifications(prev => ({...prev, email: !prev.email}))}
          />
          <ToggleItem 
            label="飞书群消息同步" 
            desc="将面试进度实时同步到飞书招聘群。"
            checked={notifications.feishu}
            onChange={() => setNotifications(prev => ({...prev, feishu: !prev.feishu}))}
          />
           <div className="pl-14">
             <Input 
               placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..." 
               label="飞书 Webhook 地址"
               disabled={!notifications.feishu}
             />
           </div>
        </div>
      </Card>

      {/* AI Configuration */}
      <Card className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <Shield className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-bold text-slate-900">AI 面试官配置</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">自动通过分数线 (0-100)</label>
            <input 
              type="number" 
              value={aiConfig.passThreshold}
              onChange={(e) => setAiConfig(prev => ({...prev, passThreshold: e.target.value}))}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20"
            />
            <p className="text-xs text-slate-500 mt-1">AI 评分高于此分数将自动标记为“待复核”。</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">模型选择</label>
            <select 
              value={aiConfig.model}
              onChange={(e) => setAiConfig(prev => ({...prev, model: e.target.value}))}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="GPT-4o">GPT-4o (推荐)</option>
              <option value="GPT-3.5">GPT-3.5 Turbo</option>
              <option value="Claude-3">Claude 3 Opus</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="flex justify-end pt-4">
        <Button size="lg" className="shadow-xl shadow-primary-500/20">
          <Save className="w-4 h-4 mr-2" />
          保存更改
        </Button>
      </div>
    </div>
  );
}

function ToggleItem({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-sm font-medium text-slate-900">{label}</h3>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
      <button 
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${checked ? 'bg-primary-600' : 'bg-slate-200'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
}
