import React, { useState } from 'react';
import { useJobs } from '../../context/JobContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminJobs() {
  const { jobs } = useJobs();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">职位管理</h1>
          <p className="text-slate-500">发布新职位或管理现有职位</p>
        </div>
        <Link to="/admin/jobs/new">
          <Button className="shadow-lg shadow-primary-500/30">
            <Plus className="w-4 h-4 mr-2" />
            发布职位
          </Button>
        </Link>
      </div>

      <Card className="p-4 flex gap-4 bg-white border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索职位名称或部门..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </Card>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">职位名称</th>
              <th className="px-6 py-4 font-semibold text-slate-700">部门</th>
              <th className="px-6 py-4 font-semibold text-slate-700">类型</th>
              <th className="px-6 py-4 font-semibold text-slate-700">地点</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredJobs.map((job) => (
              <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{job.title}</td>
                <td className="px-6 py-4 text-slate-600">{job.department}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    job.type === '全职' ? 'bg-blue-100 text-blue-700' :
                    job.type === '外包' ? 'bg-purple-100 text-purple-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {job.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{job.location}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-primary-600">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredJobs.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                  没有找到匹配的职位
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
