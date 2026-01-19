import React from 'react';
import { Card } from '../../components/ui/Card';
import { Users, Briefcase, CheckCircle, Clock, TrendingUp, Calendar } from 'lucide-react';

export function AdminDashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">概览</h1>
          <p className="text-slate-500">欢迎回来，Admin。这是今天的招聘动态。</p>
        </div>
        <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200">
          {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="待处理申请" 
          value="12" 
          trend="+2" 
          icon={Clock} 
          color="text-orange-600" 
          bg="bg-orange-50"
        />
        <StatCard 
          title="进行中面试" 
          value="5" 
          trend="0" 
          icon={Users} 
          color="text-blue-600" 
          bg="bg-blue-50"
        />
        <StatCard 
          title="在招职位" 
          value="8" 
          trend="+1" 
          icon={Briefcase} 
          color="text-purple-600" 
          bg="bg-purple-50"
        />
        <StatCard 
          title="本月入职" 
          value="3" 
          trend="+12%" 
          icon={CheckCircle} 
          color="text-green-600" 
          bg="bg-green-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-slate-900 text-lg">近期动态</h3>
          <Card className="divide-y divide-slate-50 p-0 overflow-hidden">
            {[
              { user: "李四", action: "完成了 AI 面试", time: "10分钟前", job: "React 前端开发" },
              { user: "王五", action: "提交了新申请", time: "30分钟前", job: "产品经理" },
              { user: "System", action: "自动发布了面试报告", time: "1小时前", job: "李四 - React 前端开发" },
              { user: "张三", action: "被标记为 '待复核'", time: "2小时前", job: "高级 Python 工程师" },
            ].map((activity, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                    {activity.user[0]}
                  </div>
                  <div>
                    <p className="text-sm text-slate-900 font-medium">
                      {activity.user} <span className="text-slate-500 font-normal">{activity.action}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{activity.job}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">{activity.time}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Quick Actions / AI Insights */}
        <div className="space-y-6">
          <h3 className="font-bold text-slate-900 text-lg">AI 招聘洞察</h3>
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
            <div className="flex items-start gap-3 mb-4">
              <TrendingUp className="w-5 h-5 mt-1 opacity-80" />
              <div>
                <h4 className="font-bold">效率提升</h4>
                <p className="text-white/80 text-sm mt-1">本周 AI 面试官为您节省了约 15 小时的初筛时间。</p>
              </div>
            </div>
            <div className="h-px bg-white/20 my-4" />
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 mt-1 opacity-80" />
              <div>
                <h4 className="font-bold">下周预测</h4>
                <p className="text-white/80 text-sm mt-1">预计将有 20+ 位候选人进入面试环节，请留意复核通知。</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon: Icon, color, bg }) {
  return (
    <Card className="flex items-center gap-4 hover:shadow-md transition-shadow cursor-default">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <div className="flex items-end gap-2">
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          <span className={`text-xs font-medium mb-1 ${trend.startsWith('+') ? 'text-green-600' : 'text-slate-400'}`}>
            {trend}
          </span>
        </div>
      </div>
    </Card>
  );
}
