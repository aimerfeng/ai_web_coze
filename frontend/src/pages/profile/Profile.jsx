import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Plus, Trash2, Save, User, GraduationCap, Briefcase, Award, Sparkles } from 'lucide-react';

export function Profile() {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    basics: {
      fullName: '',
      email: '',
      phone: ''
    },
    skills: [],
    education: [],
    experience: [],
    awards: []
  });

  const canSave = useMemo(() => {
    if (!profile.basics.fullName?.trim()) return false;
    return true;
  }, [profile]);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(`${API_URL}/users/me/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const incoming = data.profile_data || {};
          setProfile((prev) => ({
            ...prev,
            basics: {
              ...prev.basics,
              fullName: incoming.basics?.fullName ?? user?.name ?? '',
              email: incoming.basics?.email ?? user?.email ?? '',
              phone: incoming.basics?.phone ?? ''
            },
            skills: Array.isArray(incoming.skills) ? incoming.skills : [],
            education: Array.isArray(incoming.education) ? incoming.education : [],
            experience: Array.isArray(incoming.experience) ? incoming.experience : [],
            awards: Array.isArray(incoming.awards) ? incoming.awards : []
          }));
        } else {
          setProfile((prev) => ({
            ...prev,
            basics: { ...prev.basics, fullName: user?.name ?? '', email: user?.email ?? '' }
          }));
        }
      } catch {
        setProfile((prev) => ({
          ...prev,
          basics: { ...prev.basics, fullName: user?.name ?? '', email: user?.email ?? '' }
        }));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [token, user?.email, user?.name]);

  const saveProfile = async () => {
    if (!canSave) {
      addToast('请先填写姓名', 'warning');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/users/me/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ profile_data: profile })
      });
      if (!res.ok) throw new Error('保存失败');
      addToast('个人信息已保存', 'success');
    } catch (e) {
      addToast(e.message || '保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const value = prompt('添加技能（如：Python / React / 产品设计）');
    if (!value) return;
    const skill = value.trim();
    if (!skill) return;
    setProfile((prev) => ({
      ...prev,
      skills: Array.from(new Set([...prev.skills, skill]))
    }));
  };

  const removeSkill = (skill) => {
    setProfile((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const addEducation = () => {
    setProfile((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { school: '', degree: '', major: '', startDate: '', endDate: '', achievements: '' }
      ]
    }));
  };

  const addExperience = () => {
    setProfile((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { company: '', title: '', startDate: '', endDate: '', description: '' }
      ]
    }));
  };

  const addAward = () => {
    setProfile((prev) => ({
      ...prev,
      awards: [...prev.awards, { title: '', date: '', description: '' }]
    }));
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4">
        <Card className="p-8">
          <div className="h-7 w-40 bg-slate-200 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-56 bg-slate-100 rounded-xl animate-pulse md:col-span-2" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">个人信息</h1>
          <p className="text-slate-500 mt-1">完善你的履历信息，投递时可自动复用，并用于简历预处理。</p>
        </div>
        <Button
          onClick={saveProfile}
          disabled={!canSave || saving}
          className="shadow-lg shadow-primary-500/20"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? '保存中...' : '保存'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">基础信息</h2>
              <p className="text-xs text-slate-500">用于联系与身份识别</p>
            </div>
          </div>

          <Input
            label="姓名"
            value={profile.basics.fullName}
            onChange={(e) => setProfile((prev) => ({ ...prev, basics: { ...prev.basics, fullName: e.target.value } }))}
            placeholder="张三"
            required
          />
          <Input
            label="邮箱"
            value={profile.basics.email}
            onChange={(e) => setProfile((prev) => ({ ...prev, basics: { ...prev.basics, email: e.target.value } }))}
            placeholder="name@example.com"
          />
          <Input
            label="手机号"
            value={profile.basics.phone}
            onChange={(e) => setProfile((prev) => ({ ...prev, basics: { ...prev.basics, phone: e.target.value } }))}
            placeholder="13800000000"
          />

          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                技能标签
              </div>
              <button
                type="button"
                onClick={addSkill}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + 添加
              </button>
            </div>
            {profile.skills.length === 0 ? (
              <div className="text-sm text-slate-400 bg-slate-50 border border-slate-100 rounded-xl p-4">
                暂无技能标签，建议添加 5-10 个关键词用于岗位匹配。
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-full text-sm flex items-center gap-2 shadow-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <SectionHeader
              icon={<GraduationCap className="w-5 h-5 text-indigo-600" />}
              title="教育经历"
              actionText="添加教育"
              onAction={addEducation}
            />
            <div className="space-y-4 mt-4">
              {profile.education.length === 0 ? (
                <EmptyState text="未添加教育经历。建议至少填写最高学历。" />
              ) : (
                profile.education.map((edu, idx) => (
                  <div key={idx} className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-semibold text-slate-800">教育经历 #{idx + 1}</div>
                      <IconButton
                        onClick={() =>
                          setProfile((prev) => ({
                            ...prev,
                            education: prev.education.filter((_, i) => i !== idx)
                          }))
                        }
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Field
                        label="学校"
                        value={edu.school}
                        onChange={(v) =>
                          setProfile((prev) => ({
                            ...prev,
                            education: prev.education.map((item, i) => (i === idx ? { ...item, school: v } : item))
                          }))
                        }
                        placeholder="XX大学"
                      />
                      <Field
                        label="学历"
                        value={edu.degree}
                        onChange={(v) =>
                          setProfile((prev) => ({
                            ...prev,
                            education: prev.education.map((item, i) => (i === idx ? { ...item, degree: v } : item))
                          }))
                        }
                        placeholder="本科/硕士/博士"
                      />
                      <Field
                        label="专业"
                        value={edu.major}
                        onChange={(v) =>
                          setProfile((prev) => ({
                            ...prev,
                            education: prev.education.map((item, i) => (i === idx ? { ...item, major: v } : item))
                          }))
                        }
                        placeholder="计算机科学与技术"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Field
                          label="开始"
                          value={edu.startDate}
                          onChange={(v) =>
                            setProfile((prev) => ({
                              ...prev,
                              education: prev.education.map((item, i) => (i === idx ? { ...item, startDate: v } : item))
                            }))
                          }
                          placeholder="2019-09"
                        />
                        <Field
                          label="结束"
                          value={edu.endDate}
                          onChange={(v) =>
                            setProfile((prev) => ({
                              ...prev,
                              education: prev.education.map((item, i) => (i === idx ? { ...item, endDate: v } : item))
                            }))
                          }
                          placeholder="2023-06"
                        />
                      </div>
                    </div>
                    <Field
                      label="奖励/成果"
                      value={edu.achievements}
                      onChange={(v) =>
                        setProfile((prev) => ({
                          ...prev,
                          education: prev.education.map((item, i) => (i === idx ? { ...item, achievements: v } : item))
                        }))
                      }
                      placeholder="奖学金/竞赛/论文/项目"
                      multiline
                    />
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <SectionHeader
              icon={<Briefcase className="w-5 h-5 text-indigo-600" />}
              title="工作经历"
              actionText="添加工作"
              onAction={addExperience}
            />
            <div className="space-y-4 mt-4">
              {profile.experience.length === 0 ? (
                <EmptyState text="未添加工作经历。实习或项目经历也可以填写。" />
              ) : (
                profile.experience.map((exp, idx) => (
                  <div key={idx} className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-semibold text-slate-800">工作经历 #{idx + 1}</div>
                      <IconButton
                        onClick={() =>
                          setProfile((prev) => ({
                            ...prev,
                            experience: prev.experience.filter((_, i) => i !== idx)
                          }))
                        }
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Field
                        label="公司"
                        value={exp.company}
                        onChange={(v) =>
                          setProfile((prev) => ({
                            ...prev,
                            experience: prev.experience.map((item, i) => (i === idx ? { ...item, company: v } : item))
                          }))
                        }
                        placeholder="XX科技有限公司"
                      />
                      <Field
                        label="职位"
                        value={exp.title}
                        onChange={(v) =>
                          setProfile((prev) => ({
                            ...prev,
                            experience: prev.experience.map((item, i) => (i === idx ? { ...item, title: v } : item))
                          }))
                        }
                        placeholder="后端开发 / 产品经理"
                      />
                      <div className="grid grid-cols-2 gap-3 md:col-span-2">
                        <Field
                          label="开始"
                          value={exp.startDate}
                          onChange={(v) =>
                            setProfile((prev) => ({
                              ...prev,
                              experience: prev.experience.map((item, i) => (i === idx ? { ...item, startDate: v } : item))
                            }))
                          }
                          placeholder="2023-07"
                        />
                        <Field
                          label="结束"
                          value={exp.endDate}
                          onChange={(v) =>
                            setProfile((prev) => ({
                              ...prev,
                              experience: prev.experience.map((item, i) => (i === idx ? { ...item, endDate: v } : item))
                            }))
                          }
                          placeholder="至今/2024-12"
                        />
                      </div>
                    </div>
                    <Field
                      label="工作内容"
                      value={exp.description}
                      onChange={(v) =>
                        setProfile((prev) => ({
                          ...prev,
                          experience: prev.experience.map((item, i) => (i === idx ? { ...item, description: v } : item))
                        }))
                      }
                      placeholder="负责什么、做了什么、结果如何（建议量化）"
                      multiline
                    />
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <SectionHeader
              icon={<Award className="w-5 h-5 text-indigo-600" />}
              title="获奖与证书"
              actionText="添加条目"
              onAction={addAward}
            />
            <div className="space-y-4 mt-4">
              {profile.awards.length === 0 ? (
                <EmptyState text="未添加获奖与证书。可以填写奖学金、竞赛名次、资格证等。" />
              ) : (
                profile.awards.map((a, idx) => (
                  <div key={idx} className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-semibold text-slate-800">条目 #{idx + 1}</div>
                      <IconButton
                        onClick={() =>
                          setProfile((prev) => ({
                            ...prev,
                            awards: prev.awards.filter((_, i) => i !== idx)
                          }))
                        }
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Field
                        label="名称"
                        value={a.title}
                        onChange={(v) =>
                          setProfile((prev) => ({
                            ...prev,
                            awards: prev.awards.map((item, i) => (i === idx ? { ...item, title: v } : item))
                          }))
                        }
                        placeholder="国家奖学金/ACM 银牌"
                      />
                      <Field
                        label="时间"
                        value={a.date}
                        onChange={(v) =>
                          setProfile((prev) => ({
                            ...prev,
                            awards: prev.awards.map((item, i) => (i === idx ? { ...item, date: v } : item))
                          }))
                        }
                        placeholder="2022-11"
                      />
                      <Field
                        label="说明"
                        value={a.description}
                        onChange={(v) =>
                          setProfile((prev) => ({
                            ...prev,
                            awards: prev.awards.map((item, i) => (i === idx ? { ...item, description: v } : item))
                          }))
                        }
                        placeholder="奖项级别/影响力"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, actionText, onAction }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h2 className="font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">结构化信息可用于筛选与面试预处理</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
      >
        <Plus className="w-4 h-4" />
        {actionText}
      </button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, multiline }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-slate-500 mb-1">{label}</div>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[92px] px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      )}
    </label>
  );
}

function EmptyState({ text }) {
  return (
    <div className="text-sm text-slate-400 bg-slate-50 border border-slate-100 rounded-xl p-4">
      {text}
    </div>
  );
}

function IconButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

