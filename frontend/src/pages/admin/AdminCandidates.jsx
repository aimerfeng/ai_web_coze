import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, Filter, Eye, FileText, Video, MessageSquare, CheckCircle, XCircle, Send } from 'lucide-react';

export function AdminCandidates() {
  const [activeTab, setActiveTab] = useState('全部');
  
  // Mock Candidates Data (Will replace with API later)
  const [candidates] = useState([
    { id: 1, name: "张三", job: "高级 Python 工程师", status: "pending", score: null, appliedAt: "2024-01-15" },
    { id: 2, name: "李四", job: "React 前端开发", status: "interviewing", score: 85, appliedAt: "2024-01-14" },
    { id: 3, name: "王五", job: "产品经理", status: "review", score: 92, appliedAt: "2024-01-12" },
    { id: 4, name: "赵六", job: "Python 实习生", status: "rejected", score: 60, appliedAt: "2024-01-10" },
    { id: 5, name: "钱七", job: "高级 Python 工程师", status: "offered", score: 95, appliedAt: "2024-01-08" },
  ]);

  const statusMap = {
    'pending': { label: '待筛选', color: 'bg-yellow-100 text-yellow-700' },
    'interviewing': { label: '面试中', color: 'bg-blue-100 text-blue-700' },
    'review': { label: '待复核', color: 'bg-purple-100 text-purple-700' },
    'rejected': { label: '已淘汰', color: 'bg-red-100 text-red-700' },
    'offered': { label: '已录用', color: 'bg-green-100 text-green-700' },
  };

  const filteredCandidates = activeTab === '全部' 
    ? candidates 
    : candidates.filter(c => statusMap[c.status].label === activeTab);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">候选人管理</h1>
          <p className="text-slate-500">查看及管理所有申请者进度</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <Filter className="w-4 h-4 mr-2" />
            筛选
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            导出报表
          </Button>
        </div>
      </div>

      {/* Kanban-like Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['全部', '待筛选', '面试中', '待复核', '已录用', '已淘汰'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'bg-slate-900 text-white' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">候选人</th>
              <th className="px-6 py-4 font-semibold text-slate-700">申请职位</th>
              <th className="px-6 py-4 font-semibold text-slate-700">状态</th>
              <th className="px-6 py-4 font-semibold text-slate-700">AI 评分</th>
              <th className="px-6 py-4 font-semibold text-slate-700">申请时间</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredCandidates.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                      {c.name[0]}
                    </div>
                    <span className="font-medium text-slate-900">{c.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{c.job}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusMap[c.status].color}`}>
                    {statusMap[c.status].label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {c.score ? (
                    <span className={`font-bold ${c.score >= 90 ? 'text-green-600' : c.score >= 80 ? 'text-blue-600' : 'text-orange-600'}`}>
                      {c.score}
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-500">{c.appliedAt}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" title="查看详情">
                      <Eye className="w-4 h-4 text-slate-500" />
                    </Button>
                    {c.status === 'review' && (
                      <>
                        <Button variant="ghost" size="sm" title="通过">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="sm" title="淘汰">
                          <XCircle className="w-4 h-4 text-red-600" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm" title="飞书通知">
                      <Send className="w-4 h-4 text-blue-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
