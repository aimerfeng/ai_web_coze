import React, { createContext, useContext, useState } from 'react';

const JobContext = createContext();

export const useJobs = () => useContext(JobContext);

export const JobProvider = ({ children }) => {
  // Mock Data - editable via "admin" logic if we were building that
  const [companyInfo] = useState({
    name: "TechFuture Inc.",
    description: "我们致力于构建 AI 驱动招聘的未来。",
    website: "https://techfuture.example.com",
    logo: "https://via.placeholder.com/150"
  });

  const [jobs] = useState([
    {
      id: "1",
      title: "高级 Python 后端工程师",
      department: "工程部",
      location: "远程",
      type: "全职",
      salary: "30k - 50k",
      tags: ["Python", "FastAPI", "AI"],
      description: "加入我们的核心团队，构建可扩展的 AI 基础设施。",
      requirements: [
        "5年以上 Python 开发经验",
        "熟悉 FastAPI 和 Asyncio",
        "了解 LLM 集成"
      ],
      knowledgeBase: "我们的技术栈包括 FastAPI, Celery, Redis, 和 PostgreSQL。我们部署在 K8s 上。"
    },
    {
      id: "2",
      title: "前端开发工程师 (React)",
      department: "产品部",
      location: "北京",
      type: "全职",
      salary: "20k - 35k",
      tags: ["React", "Tailwind", "Three.js"],
      description: "为我们的 AI 产品打造美观、响应式且交互性强的用户界面。",
      requirements: [
        "3年以上 React 开发经验",
        "扎实的 CSS/Tailwind 技能",
        "有 WebRTC 经验者优先"
      ],
      knowledgeBase: "我们所有前端项目都使用 Vite, React 18, 和 Framer Motion。"
    }
  ]);

  const [applications, setApplications] = useState([]);

  const submitApplication = async (jobId, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newApp = {
          id: Date.now().toString(),
          jobId,
          ...data,
          status: 'pending', // pending -> processing -> interview_ready
          submittedAt: new Date().toISOString()
        };
        setApplications(prev => [...prev, newApp]);
        
        // Mock processing time
        setTimeout(() => {
          updateApplicationStatus(newApp.id, 'interview_ready');
        }, 10000); // 10 seconds for demo instead of 30 mins

        resolve(newApp);
      }, 1500);
    });
  };

  const updateApplicationStatus = (appId, status) => {
    setApplications(prev => prev.map(app => 
      app.id === appId ? { ...app, status } : app
    ));
  };

  return (
    <JobContext.Provider value={{ jobs, companyInfo, applications, submitApplication }}>
      {children}
    </JobContext.Provider>
  );
};
