# AI 智能招聘平台 (AI Recruitment Platform)

基于 **FastAPI + React + Coze Agent** 的下一代智能招聘系统。

![Project Status](https://img.shields.io/badge/Status-Beta-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 核心特性 (Features)

*   **🤖 AI 全流程驱动**:
    *   **智能简历解析**: 自动提取 PDF 简历中的技能、学历与工作经历。
    *   **AI 面试官**: 基于 WebSocket 的实时语音/视频面试，支持动态追问。
    *   **多维度评估**: 自动生成面试评分报告与能力雷达图。
*   **👥 完善的角色系统**:
    *   **求职者端**: 职位浏览、一键投递、个人档案管理、面试状态追踪。
    *   **HR 管理端**: 候选人看板、自动化筛选、发 Offer/淘汰通知。
*   **🛡️ 安全可靠**:
    *   JWT 身份认证。
    *   文件上传安全校验 (Magic Bytes)。
    *   敏感操作权限控制。

## 🏗️ 技术栈 (Tech Stack)

*   **Frontend**: React, Vite, TailwindCSS, Framer Motion, WebSocket
*   **Backend**: Python, FastAPI, SQLAlchemy, SQLite
*   **AI/Agent**: Coze (ByteDance), LLM Integration (DeepSeek/Claude)

## 🚀 快速开始 (Getting Started)

### 1. 环境准备
确保已安装 Python 3.9+ 和 Node.js 18+。

### 2. 启动后端
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
后端服务将运行在 `http://localhost:8000`

### 3. 启动前端
```bash
cd frontend
npm install
npm run dev
```
前端页面将运行在 `http://localhost:5173`

## 📂 项目结构 (Project Structure)

```
hr_web_coze/
├── backend/
│   ├── routers/          # 模块化路由 (Auth, Jobs, AI, etc.)
│   ├── main.py           # 入口文件
│   ├── models.py         # 数据库模型
│   └── resume_parser.py  # 简历解析逻辑
├── frontend/
│   ├── src/
│   │   ├── pages/        # 页面组件 (Dashboard, Interview, etc.)
│   │   ├── components/   # 通用组件
│   │   └── context/      # 全局状态管理
└── docs/                 # 项目文档与设计图
```

## 📝 开发计划 (Roadmap)

- [x] 基础职位管理与投递流程
- [x] 用户个人档案 (Profile) 系统
- [x] WebSocket 实时面试房间
- [x] 后端架构重构与安全加固
- [ ] 对接 Coze 真实 API (目前为 Mock/本地逻辑)
- [ ] 集成真实邮件服务 (SMTP)
- [ ] 视频面试录制回放功能

## 📄 文档 (Documentation)

详细的设计文档位于 `docs/project_analysis/` 目录下：
*   [01_Project_Architecture.md](docs/project_analysis/01_Project_Architecture.md): 架构设计
*   [08_AI_Workflow_Design.md](docs/project_analysis/08_AI_Workflow_Design.md): AI 业务流设计
