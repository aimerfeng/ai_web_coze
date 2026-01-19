import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MapPin, Briefcase, ArrowLeft, BookOpen } from 'lucide-react';
import { JobChat } from '../../components/JobChat';

export function JobDetail() {
  const { id } = useParams();
  const { jobs } = useJobs();
  const job = jobs.find(j => j.id == id); // Use loose equality for string/number id match

  if (!job) return <div>Job not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up pb-20">
      <Link to="/jobs" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回职位列表
      </Link>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <Card>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
            <div className="flex flex-wrap gap-4 text-slate-600 mb-6">
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {job.department}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.location}
              </div>
              <div className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-sm font-medium">
                {job.salary}
              </div>
              {job.type && (
                <div className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                  {job.type}
                </div>
              )}
            </div>

            <div className="prose prose-slate max-w-none">
              <h3 className="text-lg font-semibold text-slate-900">职位描述</h3>
              <p className="text-slate-600 whitespace-pre-wrap">{job.description}</p>
              
              <h3 className="text-lg font-semibold text-slate-900 mt-6">职位要求</h3>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                {job.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          </Card>

          {job.knowledgeBase && (
            <Card className="bg-blue-50/50 border-blue-100">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-primary-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-primary-900">公开知识库</h3>
                  <p className="text-sm text-primary-700 mt-1">{job.knowledgeBase}</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24">
            <h3 className="font-semibold text-slate-900 mb-4">准备好申请了吗？</h3>
            <Link to={`/apply/${job.id}`}>
              <Button className="w-full shadow-xl shadow-primary-500/20">
                立即申请
              </Button>
            </Link>
            <p className="text-xs text-slate-500 text-center mt-3">
              通常在3天内回复
            </p>
          </Card>
        </div>
      </div>

      <JobChat job={job} />
    </div>
  );
}
