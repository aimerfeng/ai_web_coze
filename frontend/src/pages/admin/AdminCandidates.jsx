import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, Filter, Eye, FileText, Video, MessageSquare, CheckCircle, XCircle, Send, Download, Brain, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AnimatePresence, motion } from 'framer-motion';

export function AdminCandidates() {
  const [activeTab, setActiveTab] = useState('全部');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // id being updated
  const [expandedId, setExpandedId] = useState(null); // For detail view
  const { token } = useAuth();
  const { addToast } = useToast();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchCandidates = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCandidates(data);
      }
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [token]);

  const updateStatus = async (appId, newStatus) => {
    setUpdating(appId);
    try {
      const res = await fetch(`${API_URL}/admin/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) throw new Error('操作失败');
      
      addToast('状态更新成功', 'success');
      // Refresh list
      fetchCandidates();
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setUpdating(null);
    }
  };

  const statusMap = {
    'pending': { label: '待筛选', color: 'bg-yellow-100 text-yellow-700' },
    'interview_ready': { label: '待面试', color: 'bg-green-100 text-green-700' },
    'interviewing': { label: '面试中', color: 'bg-blue-100 text-blue-700' },
    'review': { label: '待复核', color: 'bg-purple-100 text-purple-700' },
    'rejected': { label: '已淘汰', color: 'bg-red-100 text-red-700' },
    'offered': { label: '已录用', color: 'bg-green-100 text-green-700' },
  };

  const filteredCandidates = activeTab === '全部' 
    ? candidates 
    : candidates.filter(c => (statusMap[c.status]?.label || c.status) === activeTab);

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
        {['全部', '待筛选', '待面试', '面试中', '待复核', '已录用', '已淘汰'].map((tab) => (
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

      <div className="space-y-4">
        {filteredCandidates.map((c) => (
          <motion.div 
            layout
            key={c.id} 
            className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div 
              className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg">
                  {c.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{c.name}</h3>
                  <p className="text-sm text-slate-500">{c.job}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* AI Tags Preview */}
                {c.structured_resume && (
                  <div className="hidden md:flex gap-2">
                    {c.structured_resume.skills?.slice(0, 3).map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                        {skill}
                      </span>
                    ))}
                    {c.structured_resume.education?.[0] && (
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-md flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        {c.structured_resume.education[0].school}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusMap[c.status]?.color || 'bg-gray-100'}`}>
                    {statusMap[c.status]?.label || c.status}
                  </span>
                  <span className="text-sm text-slate-400">{c.appliedAt}</span>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {expandedId === c.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-100 bg-slate-50/50"
                >
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Resume Info */}
                    <div className="md:col-span-2 space-y-4">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> 简历详情
                      </h4>
                      
                      {c.structured_resume ? (
                        <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-4">
                          <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">技能栈</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {c.structured_resume.skills?.map((s, i) => (
                                <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">教育经历</span>
                            <ul className="mt-2 space-y-2">
                              {c.structured_resume.education?.map((edu, i) => (
                                <li key={i} className="text-sm text-slate-700 flex justify-between">
                                  <span className="font-medium">{edu.school}</span>
                                  <span className="text-slate-500">{edu.degree}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500 italic">未提供结构化简历数据</div>
                      )}

                      <div className="flex gap-3">
                        {c.github_link && (
                          <a href={c.github_link} target="_blank" rel="noreferrer">
                            <Button variant="outline" size="sm">
                              <Github className="w-4 h-4 mr-2" /> 查看 GitHub
                            </Button>
                          </a>
                        )}
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" /> 下载原始 PDF
                        </Button>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="space-y-4 border-l border-slate-200 pl-6">
                      <h4 className="font-bold text-slate-900">操作</h4>
                      <div className="space-y-2">
                        <Button 
                          className="w-full justify-start"
                          onClick={() => updateStatus(c.id, 'interview_ready')}
                          disabled={updating === c.id || c.status === 'interview_ready'}
                        >
                          {updating === c.id ? <Loader className="w-4 h-4 animate-spin mr-2"/> : <Video className="w-4 h-4 mr-2" />}
                          邀请 AI 面试
                        </Button>
                        <Button variant="secondary" className="w-full justify-start">
                          <MessageSquare className="w-4 h-4 mr-2" /> 发送消息
                        </Button>
                        <div className="pt-4 flex gap-2">
                          <Button 
                            variant="ghost" 
                            className="flex-1 text-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={() => updateStatus(c.id, 'offered')}
                            disabled={updating === c.id || c.status === 'offered'}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" /> 录用
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => updateStatus(c.id, 'rejected')}
                            disabled={updating === c.id || c.status === 'rejected'}
                          >
                            <XCircle className="w-4 h-4 mr-2" /> 淘汰
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Github({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.527.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.653.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
