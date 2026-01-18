import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Upload, X, FileText, Github, CheckCircle } from 'lucide-react';

export function ApplicationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, submitApplication } = useJobs();
  const job = jobs.find(j => j.id === id);

  const [loading, setLoading] = useState(false);
  const [githubLink, setGithubLink] = useState('');
  const [files, setFiles] = useState({
    resume: null,
    studentId: null,
    portfolio: null
  });

  if (!job) return <div>Job not found</div>;

  const handleFileChange = (type, e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const removeFile = (type) => {
    setFiles(prev => ({ ...prev, [type]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In a real app, we'd upload files to S3/Server here
      const applicationData = {
        githubLink,
        files: Object.keys(files).filter(k => files[k]).map(k => files[k].name)
      };
      
      await submitApplication(job.id, applicationData);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 animate-slide-up">
      <Card>
        <div className="mb-8 border-b border-slate-100 pb-6">
          <h1 className="text-2xl font-bold text-slate-900">申请职位：{job.title}</h1>
          <p className="text-slate-500 mt-1">请填写以下表单以提交您的申请。</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* GitHub Link */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Github className="w-5 h-5" />
              代码库 & 作品集
            </h3>
            <Input 
              placeholder="https://github.com/username" 
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
              label="GitHub 个人主页 / 作品集链接"
            />
          </div>

          {/* File Uploads */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              文档资料
            </h3>
            
            <FileUploadField 
              label="简历 / CV" 
              accept=".pdf,.doc,.docx"
              file={files.resume}
              onChange={(e) => handleFileChange('resume', e)}
              onRemove={() => removeFile('resume')}
              required
            />

            <FileUploadField 
              label="学生证 / 学信网截图" 
              accept=".jpg,.png,.pdf"
              file={files.studentId}
              onChange={(e) => handleFileChange('studentId', e)}
              onRemove={() => removeFile('studentId')}
            />

            <FileUploadField 
              label="设计作品集 (可选)" 
              accept=".pdf,.zip,.rar"
              file={files.portfolio}
              onChange={(e) => handleFileChange('portfolio', e)}
              onRemove={() => removeFile('portfolio')}
              helperText="最大 50MB。支持 Zip 压缩包。"
            />
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              取消
            </Button>
            <Button type="submit" isLoading={loading}>
              提交申请
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function FileUploadField({ label, accept, file, onChange, onRemove, required, helperText }) {
  const inputRef = useRef(null);

  return (
    <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-primary-400 hover:bg-slate-50 transition-colors cursor-pointer group"
         onClick={() => !file && inputRef.current?.click()}>
      
      <input 
        type="file" 
        className="hidden" 
        accept={accept} 
        ref={inputRef}
        onChange={onChange}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${file ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500 group-hover:bg-primary-100 group-hover:text-primary-600'}`}>
            {file ? <CheckCircle className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
          </div>
          <div>
            <p className="font-medium text-slate-700">{label} {required && <span className="text-red-500">*</span>}</p>
            <p className="text-xs text-slate-400">
              {file ? file.name : (helperText || `点击上传 ${accept}`)}
            </p>
          </div>
        </div>

        {file && (
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
