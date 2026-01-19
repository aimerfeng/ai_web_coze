import React from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Clock, CheckCircle, Play, FileText, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton';

export function Dashboard() {
  const { applications, jobs, loading } = useJobs();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pt-10">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
             <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Stats
  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const readyCount = applications.filter(a => a.status === 'interview_ready').length;
  const completedCount = applications.filter(a => ['rejected', 'offered'].includes(a.status)).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-primary-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">欢迎回来，{user?.name || '求职者'}</h1>
          <p className="text-primary-100 max-w-lg">
            您的求职进展一览。AI 正在全天候为您筛选机会并处理申请。
          </p>
          <div className="flex gap-6 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold">{applications.length}</div>
              <div className="text-xs text-primary-200 uppercase tracking-wider">总申请</div>
            </div>
            <div className="w-px bg-white/20 h-10 self-center" />
            <div className="text-center">
              <div className="text-2xl font-bold">{readyCount}</div>
              <div className="text-xs text-primary-200 uppercase tracking-wider">待面试</div>
            </div>
            <div className="w-px bg-white/20 h-10 self-center" />
            <div className="text-center">
              <div className="text-2xl font-bold">{pendingCount}</div>
              <div className="text-xs text-primary-200 uppercase tracking-wider">筛选中</div>
            </div>
          </div>
        </div>
        {/* Decorative Circles */}
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute right-20 -bottom-20 w-48 h-48 bg-indigo-500/30 rounded-full blur-2xl" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
             <FileText className="w-5 h-5 text-slate-500" />
             最近申请
           </h2>
           <Link to="/jobs">
             <Button variant="ghost" size="sm">浏览更多职位 &rarr;</Button>
           </Link>
        </div>

        {applications.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 border-slate-200 bg-slate-50/50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">暂无申请记录</h3>
            <p className="text-slate-500 mt-2 mb-6 max-w-sm mx-auto">
              您还没有申请任何职位。立即浏览我们的开放职位，开启您的 AI 面试之旅。
            </p>
            <Link to="/jobs">
              <Button className="shadow-lg shadow-primary-500/20">浏览职位</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4">
            {applications.map((app) => {
              const job = jobs.find(j => j.id === app.jobId);
              return (
                <ApplicationCard key={app.id} app={app} job={job} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicationCard({ app, job }) {
  const isReady = app.status === 'interview_ready';
  const isPending = app.status === 'pending';

  return (
    <Card className="flex flex-col md:flex-row items-center gap-6">
      <div className="flex-1">
        <h3 className="text-xl font-bold text-slate-900">{job?.title || 'Unknown Role'}</h3>
        <p className="text-slate-500">{job?.department} • 申请于 {new Date(app.submittedAt).toLocaleDateString()}</p>
        
        <div className="mt-4 flex items-center gap-2">
          {isPending && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              AI 简历分析中 (~30m)
            </span>
          )}
          {isReady && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              待面试
            </span>
          )}
        </div>
      </div>

      <div className="w-full md:w-auto">
        {isReady ? (
          <Link to={`/interview/${app.id}`}>
            <Button className="w-full md:w-auto animate-pulse-slow">
              <Play className="w-4 h-4 mr-2" />
              开始 AI 面试
            </Button>
          </Link>
        ) : (
          <Button variant="secondary" disabled className="w-full md:w-auto opacity-70">
            <Clock className="w-4 h-4 mr-2" />
            等待通知
          </Button>
        )}
      </div>
    </Card>
  );
}
