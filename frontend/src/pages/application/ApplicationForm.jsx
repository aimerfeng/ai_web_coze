import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { FileText, Github, Upload, Check, Plus, Trash2, Brain, Loader, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AnimatePresence, motion } from 'framer-motion';

export function ApplicationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, submitApplication, loading: jobsLoading } = useJobs();
  const { token } = useAuth(); // Need token for direct parse call
  const job = jobs.find(j => j.id == id);
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [githubLink, setGithubLink] = useState('');
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState({
    resume: null,
    studentId: null,
    portfolio: null
  });

  // Structured Data State
  const [smartData, setSmartData] = useState({
    skills: [],
    education: [], // { school, degree, year }
    experience: [] // { company, role, year }
  });
  const [showSmartForm, setShowSmartForm] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  if (jobsLoading) return <div className="flex justify-center p-10">Loading jobs...</div>;
  if (!job) return <div>Job not found (ID: {id})</div>;

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    if (!files.resume) {
      newErrors.resume = '请上传简历文件';
      isValid = false;
    }
    if (githubLink) {
      const githubRegex = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;
      if (!githubRegex.test(githubLink)) {
        newErrors.githubLink = '请输入有效的 GitHub 链接';
        isValid = false;
      }
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleFileChange = async (type, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        addToast('文件大小不能超过 10MB', 'error');
        return;
      }
      setFiles(prev => ({ ...prev, [type]: file }));
      if (errors[type]) setErrors(prev => ({ ...prev, [type]: null }));

      // Auto-Parse Resume
      if (type === 'resume' && file.type === 'application/pdf') {
        setParsing(true);
        setShowSmartForm(true);
        const formData = new FormData();
        formData.append('resume', file);
        
        try {
          const res = await fetch(`${API_URL}/resume/parse`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
          });
          if (res.ok) {
            const data = await res.json();
            setSmartData(prev => ({
              ...prev,
              skills: data.skills || [],
              education: data.education || [],
              experience: data.experience || []
            }));
            addToast('简历解析成功！请确认下方信息', 'success');
          } else {
            addToast('智能解析失败，请手动填写', 'warning');
          }
        } catch (error) {
          console.error(error);
          addToast('解析服务暂不可用', 'warning');
        } finally {
          setParsing(false);
        }
      }
    }
  };

  const removeFile = (type) => {
    setFiles(prev => ({ ...prev, [type]: null }));
    if (type === 'resume') setShowSmartForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Use FormData to send file + JSON string
      const formData = new FormData();
      formData.append('job_id', id);
      formData.append('github_link', githubLink);
      formData.append('resume', files.resume);
      formData.append('structured_resume_json', JSON.stringify(smartData));

      const res = await fetch(`${API_URL}/applications`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error('提交失败');

      addToast('申请提交成功！', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 animate-fade-in">
      <Card className="p-8 shadow-xl border-t-4 border-t-primary-500">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">申请职位：{job.title}</h1>
          <p className="text-slate-500">请完善您的申请信息，智能简历解析将辅助您快速填写。</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* GitHub Link */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Github className="w-5 h-5" />
              代码仓库
            </h3>
            <Input 
              placeholder="https://github.com/username" 
              value={githubLink}
              onChange={(e) => {
                setGithubLink(e.target.value);
                if (errors.githubLink) setErrors(prev => ({ ...prev, githubLink: null }));
              }}
              label="GitHub 个人主页 / 作品集链接"
              error={errors.githubLink}
            />
          </div>

          {/* File Uploads */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              文档资料
            </h3>
            
            <div className="space-y-2">
              <FileUploadField 
                label="简历 / CV (支持 PDF 智能解析)" 
                accept=".pdf,.doc,.docx"
                file={files.resume}
                onChange={(e) => handleFileChange('resume', e)}
                onRemove={() => removeFile('resume')}
                required
                hasError={!!errors.resume}
                isParsing={parsing}
              />
              {errors.resume && <p className="text-sm text-red-500 pl-1">{errors.resume}</p>}
            </div>
          </div>

          {/* Smart Resume Editor */}
          <AnimatePresence>
            {showSmartForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-6 space-y-6">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold mb-4">
                    <Brain className="w-5 h-5" />
                    <h3>智能简历信息 (已自动提取)</h3>
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">技能标签</label>
                    <div className="flex flex-wrap gap-2">
                      {smartData.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-white border border-indigo-100 text-indigo-600 rounded-full text-sm flex items-center gap-1 shadow-sm">
                          {skill}
                          <button 
                            type="button"
                            onClick={() => setSmartData(prev => ({...prev, skills: prev.skills.filter((_, i) => i !== idx)}))}
                            className="hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <button 
                        type="button"
                        onClick={() => {
                          const newSkill = prompt("添加技能:");
                          if (newSkill) setSmartData(prev => ({...prev, skills: [...prev.skills, newSkill]}));
                        }}
                        className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium hover:bg-indigo-200 transition-colors"
                      >
                        + 添加
                      </button>
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-slate-700">教育经历</label>
                      <button 
                        type="button"
                        onClick={() => setSmartData(prev => ({...prev, education: [...prev.education, {school: '', degree: '', year: ''}]}))}
                        className="text-xs text-indigo-600 font-medium hover:underline"
                      >
                        + 添加教育
                      </button>
                    </div>
                    <div className="space-y-3">
                      {smartData.education.map((edu, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input 
                            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg"
                            placeholder="学校名称"
                            value={edu.school}
                            onChange={(e) => {
                              const newEdu = [...smartData.education];
                              newEdu[idx].school = e.target.value;
                              setSmartData({...smartData, education: newEdu});
                            }}
                          />
                          <input 
                            className="w-24 px-3 py-2 text-sm border border-slate-200 rounded-lg"
                            placeholder="学历"
                            value={edu.degree}
                            onChange={(e) => {
                              const newEdu = [...smartData.education];
                              newEdu[idx].degree = e.target.value;
                              setSmartData({...smartData, education: newEdu});
                            }}
                          />
                          <button 
                             type="button"
                             onClick={() => setSmartData(prev => ({...prev, education: prev.education.filter((_, i) => i !== idx)}))}
                             className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {smartData.education.length === 0 && <p className="text-xs text-slate-400">未检测到教育经历，请手动添加。</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>取消</Button>
            <Button type="submit" isLoading={loading} className="px-8 shadow-lg shadow-primary-500/20">
              提交申请
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function FileUploadField({ label, accept, file, onChange, onRemove, required, helperText, hasError, isParsing }) {
  const inputRef = useRef(null);

  return (
    <div className={`p-4 border-2 border-dashed rounded-xl transition-colors cursor-pointer group ${
      hasError 
        ? 'border-red-300' 
        : 'border-slate-200 hover:border-primary-400 hover:bg-slate-50'
    }`}
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
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            file 
              ? 'bg-green-100 text-green-600' 
              : 'bg-slate-100 text-slate-500 group-hover:bg-primary-100 group-hover:text-primary-600'
          }`}>
            {isParsing ? <Loader className="w-5 h-5 animate-spin text-indigo-600" /> : 
             file ? <CheckCircle className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
          </div>
          <div>
            <p className={`font-medium text-sm ${hasError ? 'text-red-600' : 'text-slate-700'}`}>
              {isParsing ? '正在智能解析简历...' : file ? file.name : label}
            </p>
            {!file && <p className="text-xs text-slate-400 mt-0.5">点击或拖拽上传 {required && '*'}</p>}
          </div>
        </div>
        
        {file && !isParsing && (
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
