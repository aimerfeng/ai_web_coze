import React from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MapPin, Briefcase, ChevronRight } from 'lucide-react';

export function JobBoard() {
  const { jobs, companyInfo } = useJobs();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">{companyInfo.name} 招聘职位</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">{companyInfo.description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <Card key={job.id} className="flex flex-col hover:shadow-2xl transition-all duration-300 border-t-4 border-t-primary-500">
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 line-clamp-2">{job.title}</h3>
                <p className="text-sm text-primary-600 font-medium mt-1">{job.department}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {job.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {job.type} • {job.salary}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link to={`/jobs/${job.id}`}>
                <Button variant="secondary" className="w-full group">
                  查看详情
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
