# 01. 项目架构总览 (Architecture Overview)

## 1. 核心理念
本项目是一个 **"本地感官 + 云端大脑"** 的 AI 智能面试系统。
*   **本地感官**: 负责实时数据采集与初步分析（视频流处理、视线追踪、音频采集）。
*   **云端大脑 (Coze)**: 负责复杂的逻辑编排、对话生成、意图识别与知识库检索。

## 2. 技术栈架构

### 前端 (Frontend)
*   **框架**: React 18 + Vite
*   **UI 库**: Tailwind CSS, Lucide Icons, Framer Motion (动画)
*   **核心功能**:
    *   **WebRTC**: 获取摄像头与麦克风流。
    *   **WebSocket**: 与后端进行低延迟双向通信。
    *   **SPA 路由**: 管理员端 (`/admin`) 与 候选人端 (`/`) 逻辑分离。

### 后端 (Backend)
*   **框架**: FastAPI (Python 3.8+)
*   **通信协议**:
    *   **HTTP (REST)**: 用于 CRUD 操作（职位管理、简历投递、用户认证）。
    *   **WebSocket**: 用于实时面试交互（传输音频流、视频帧、信令）。
*   **视觉 AI**: MediaPipe (本地运行，负责实时人脸检测与风险预警)。
*   **编排层**: 封装了 Coze API 的调用逻辑。

### 数据库 (Database)
*   **类型**: SQLite (轻量级，方便本地部署)
*   **ORM**: SQLAlchemy

## 3. 数据流向 (Data Flow)

### 场景 A: 候选人申请职位
1.  **用户** 在前端填写表单 (Github, 简历)。
2.  **前端** 调用 `POST /applications`。
3.  **后端** 写入 SQLite 数据库。
4.  **管理员** 在后台可见新申请。

### 场景 B: AI 视频面试 (核心)
1.  **连接**: 前端通过 `ws://localhost:8000/ws/interview` 建立长连接。
2.  **视觉流**: 前端按帧抽取视频画面 (Base64)，发送给后端。
    *   -> 后端 `ObserverAgent` (MediaPipe) 分析是否有人、视线是否偏移。
    *   -> 产生风险日志 (`risk_logs`)。
3.  **对话流**:
    *   **用户说话** -> 前端录音 -> 发送音频 Bytes -> 后端 `STTService` 转文字。
    *   **文字处理** -> 后端 `CozeService` 发送给 Coze Bot。
    *   **AI 回复** -> Coze 返回文字 -> 后端 `TTSService` 转语音 -> 发送给前端播放。

## 4. 目录结构说明
```text
.   
├── backend/                # Python 核心服务
│   ├── main.py             # 入口：路由分发、WebSocket 握手
│   ├── controller.py       # 面试流程控制器 (协调 STT, TTS, Coze, Observer)
│   ├── services.py         # 第三方服务封装 (Coze, STT, TTS) - *目前为 Mock*
│   ├── observer.py         # 视觉 AI (MediaPipe)
│   ├── models.py           # 数据库模型
│   └── database.py         # 数据库连接
├── frontend/               # React 前端
│   ├── src/pages/admin/    # 管理员后台 (仪表盘, 职位管理)
│   ├── src/pages/jobs/     # 候选人页面 (职位列表, 详情)
│   ├── src/context/        # 全局状态 (JobContext, AuthContext)
│   └── ...
└── docs/                   # 文档
```
