# AI 智能面试系统 (AI Interviewer System)

这是一个基于 "本地感官 + 云端大脑" 架构的 AI 面试系统。本项目主要包含视频流处理、语义分解、流程管理以及前端知识库管理等核心功能。

## 项目特点

*   **视频流处理**: 集成 Google MediaPipe 进行实时人脸检测与视线追踪，确保面试过程的真实性与专注度。
*   **语义分解**: 后端通过 Coze Workflow 对面试内容进行深度的语义分析与意图识别。
*   **流程管理**: 完整的面试状态机管理（连接中、面试中、思考中、回答中），保障面试流程的顺畅流转。
*   **前端知识库管理**: 针对职位描述（JD）与企业知识库的结构化管理与展示。

## 目录结构
- `backend/`: Python FastAPI 后端 (WebSocket, CV, Controller, 数据库模型)。
- `frontend/`: React 前端 (WebRTC, UI, Tailwind CSS)。
- `docs/`: 文档说明。

## 快速开始

### 1. 后端启动
需要 Python 3.8+。

```bash
# 在项目根目录下
python start_backend.py
```
服务运行在: `http://localhost:8000`

### 2. 前端启动
需要 Node.js 16+。

```bash
cd frontend
npm install
npm run dev
```
访问: `http://localhost:5173`

### 3. 测试账号
- **邮箱**: `test@example.com`
- **密码**: `password123`

## 技术栈

- **前端**: React, Vite, Tailwind CSS, Lucide Icons
- **后端**: FastAPI, WebSocket, SQLAlchemy (SQLite), MediaPipe
- **AI 编排**: Coze (字节跳动扣子)

## 配置说明
- **Coze API**: 修改 `backend/services.py` 中的 `CozeService` 类，填入真实的 API Token。
- **STT/TTS**: 目前默认为 Mock 模式。如需真实语音交互，请配置 Groq/OpenAI Key。
