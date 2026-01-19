import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const JobContext = createContext();

export const useJobs = () => useContext(JobContext);

export const JobProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock Company Data
  const [companyInfo] = useState({
    name: "TechFuture Inc.",
    description: "我们致力于构建 AI 驱动招聘的未来。",
    website: "https://techfuture.example.com",
    logo: "https://via.placeholder.com/150"
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Fetch Jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${API_URL}/jobs`);
        if (res.ok) {
          const data = await res.json();
          // Transform backend data to frontend format if needed
          // Backend: salary_range, type
          // Frontend (legacy): salary, tags (can derive from type/dept)
          const formattedJobs = data.map(j => ({
            ...j,
            salary: j.salary_range,
            tags: [j.department, j.type, j.location].filter(Boolean),
            requirements: j.requirements ? j.requirements.split('\n') : [] // Assuming stored as text
          }));
          setJobs(formattedJobs);
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Fetch Applications (when user is logged in)
  useEffect(() => {
    const fetchApplications = async () => {
      if (!token) {
        setApplications([]);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/applications/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Map backend application to frontend structure
          // Backend: job_id, status, created_at
          const formattedApps = data.map(app => ({
            id: app.id,
            jobId: app.job_id,
            status: app.status,
            submittedAt: app.created_at,
            githubLink: app.github_link
          }));
          setApplications(formattedApps);
        }
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      }
    };

    fetchApplications();
  }, [token]);

  const submitApplication = async (jobId, data) => {
    if (!token) throw new Error("Must be logged in");

    const res = await fetch(`${API_URL}/applications`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        job_id: jobId,
        github_link: data.githubLink,
        // resume_path: data.resumePath // Handle file upload separately later
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Application failed");
    }

    const newApp = await res.json();
    // Optimistic update or refetch
    setApplications(prev => [...prev, {
      id: newApp.id,
      jobId: newApp.job_id,
      status: newApp.status,
      submittedAt: newApp.created_at,
      githubLink: newApp.github_link
    }]);
    
    return newApp;
  };

  return (
    <JobContext.Provider value={{ jobs, companyInfo, applications, submitApplication, loading }}>
      {children}
    </JobContext.Provider>
  );
};
