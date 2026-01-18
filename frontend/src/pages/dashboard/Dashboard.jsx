import React from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Clock, CheckCircle, Play, FileText, Loader2 } from 'lucide-react';

export function Dashboard() {
  const { applications, jobs } = useJobs();

  if (applications.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">暂无申请记录</h2>
        <p className="text-slate-500 mt-2 mb-8">开始您的求职之旅，探索我们的开放职位。</p>
        <Link to="/jobs">
          <Button>浏览职位</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-900">我的申请</h1>
      
      <div className="grid gap-4">
        {applications.map((app) => {
          const job = jobs.find(j => j.id === app.jobId);
          return (
            <ApplicationCard key={app.id} app={app} job={job} />
          );
        })}
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
