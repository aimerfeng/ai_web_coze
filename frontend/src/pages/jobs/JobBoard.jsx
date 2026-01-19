import React, { useState } from 'react';
import { useJobs } from '../../context/JobContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MapPin, Briefcase, ChevronRight, X, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { JobDetail } from './JobDetail'; // We'll reuse logic or components from here later, but for now we build a custom modal view

export function JobBoard() {
  const { jobs, companyInfo } = useJobs();
  const [filterType, setFilterType] = useState('全部');
  const [selectedJob, setSelectedJob] = useState(null);

  const filteredJobs = filterType === '全部' 
    ? jobs 
    : jobs.filter(job => job.type === filterType);

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Hero Section */}
      <div className="text-center space-y-6 pt-10">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
          加入 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent">{companyInfo.name}</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {companyInfo.description} <br/>
          <span className="text-base text-slate-500">与顶尖团队一起，用 AI 重塑未来。</span>
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center">
        <div className="bg-white/50 backdrop-blur-sm p-1.5 rounded-full shadow-sm border border-white/50 flex gap-1">
          {['全部', '全职', '兼职', '外包', '实习'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                filterType === type 
                  ? 'bg-white text-primary-600 shadow-md scale-105' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Job Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-4">
        {filteredJobs.map((job) => (
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            key={job.id}
          >
            <Card 
              className="group h-full flex flex-col hover:shadow-2xl hover:shadow-primary-900/5 transition-all duration-300 border-t-4 border-t-transparent hover:border-t-primary-500 cursor-pointer relative overflow-hidden"
              onClick={() => setSelectedJob(job)}
            >
              {/* Card Decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 group-hover:bg-primary-100/50" />
              
              <div className="flex-1 space-y-5 relative z-10">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 line-clamp-2 group-hover:text-primary-700 transition-colors">{job.title}</h3>
                    <p className="text-sm text-primary-600 font-medium mt-1 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {job.department}
                    </p>
                  </div>
                  {job.is_urgent && (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded-full font-bold uppercase tracking-wider shadow-sm">
                      <Sparkles className="w-3 h-3" /> 急招
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                    job.type === '全职' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    job.type === '外包' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                    'bg-slate-50 text-slate-700 border-slate-100'
                  }`}>
                    {job.type}
                  </span>
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-100 rounded-md text-xs font-medium">
                    {job.salary}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-100 rounded-md text-xs font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {job.location}
                  </span>
                </div>

                <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 3天前发布
                </span>
                <span className="group-hover:translate-x-1 transition-transform text-primary-600 font-medium flex items-center gap-1">
                  查看详情 <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row z-10"
            >
              <button 
                onClick={() => setSelectedJob(null)}
                className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-slate-100 rounded-full transition-colors z-20"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>

              {/* Left: Job Details */}
              <div className="flex-1 overflow-y-auto p-8 border-r border-slate-100 custom-scrollbar">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">{selectedJob.title}</h2>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="text-primary-600 font-medium">{selectedJob.department}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600">{selectedJob.location}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-green-600 font-medium">{selectedJob.salary}</span>
                    </div>
                  </div>

                  <div className="prose prose-slate prose-sm max-w-none">
                    <h3 className="text-base font-bold text-slate-900">职位描述</h3>
                    <p className="whitespace-pre-wrap">{selectedJob.description}</p>
                    
                    <h3 className="text-base font-bold text-slate-900 mt-6">任职要求</h3>
                    <ul className="list-disc pl-4 space-y-1">
                      {selectedJob.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right: Quick Action & Summary */}
              <div className="w-full md:w-80 bg-slate-50 p-8 flex flex-col justify-between shrink-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-4">为什么选择我们？</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>AI 驱动的高效面试流程</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>极具竞争力的薪资待遇</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>开放透明的晋升机制</span>
                      </li>
                    </ul>
                  </div>

                  {selectedJob.public_knowledge && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <h4 className="font-bold text-blue-900 text-sm mb-2">✨ 团队福利</h4>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        {selectedJob.public_knowledge}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mt-8">
                  <Link to={`/jobs/${selectedJob.id}`} className="block">
                    <Button variant="ghost" className="w-full justify-center">
                      查看完整详情
                    </Button>
                  </Link>
                  <Link to={`/apply/${selectedJob.id}`} className="block">
                    <Button className="w-full justify-center shadow-lg shadow-primary-500/20">
                      立即申请
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
