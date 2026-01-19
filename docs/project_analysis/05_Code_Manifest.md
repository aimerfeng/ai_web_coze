# 05. 代码文件清单 (Code Manifest)

本文件详细列出了项目中的关键代码文件及其职责。

## 1. 后端 (`/backend`)

*   **`main.py`**: 
    *   **核心入口**: 启动 FastAPI 服务器。
    *   **路由注册**: 定义了 `/jobs`, `/auth`, `/applications` 等所有 HTTP 接口。
    *   **WebSocket**: 定义了 `/ws/interview` 端点，负责建立面试连接。
*   **`models.py`**: 
    *   定义了数据库表结构 (`User`, `Job`, `Application`)。
*   **`database.py`**: 
    *   负责创建 SQLite 数据库连接引擎。
*   **`auth.py`**: 
    *   负责 JWT Token 的生成与校验。
    *   提供 `get_current_user` 依赖项，用于保护 API。
*   **`services.py`**: 
    *   **CozeService**: 封装 Coze API 调用 (目前为 Mock)。
    *   **STTService**: 语音转文字 (目前为 Mock)。
    *   **TTSService**: 文字转语音 (目前为 Mock)。
*   **`observer.py`**: 
    *   集成 **MediaPipe**，负责处理视频帧，检测人脸和视线。
*   **`controller.py`**: 
    *   **中枢神经**: 管理面试会话的状态机。它接收 WebSocket 消息，协调调用 STT -> Coze -> TTS，并将结果推回前端。

## 2. 前端 (`/frontend/src`)

### 核心组件
*   **`App.jsx`**: 路由配置文件，定义了哪些 URL 显示哪些页面。
*   **`main.jsx`**: React 入口文件，挂载 CSS。
*   **`context/AuthContext.jsx`**: 管理用户登录状态 (Token)。
*   **`context/JobContext.jsx`**: 管理职位数据和申请逻辑。

### 页面 (Pages)
*   **`pages/jobs/JobBoard.jsx`**: 职位列表页 (含流体背景、卡片筛选)。
*   **`pages/jobs/JobDetail.jsx`**: 职位详情页 (现已通过模态框增强)。
*   **`pages/interview/InterviewRoom.jsx`**: **AI 面试间**，包含 WebRTC 视频流展示和音频可视化。
*   **`pages/admin/`**: 管理员相关页面 (登录、仪表盘、职位发布、候选人管理)。

### UI 组件
*   **`components/FluidBackground.jsx`**: 背景流动动画组件。
*   **`components/JobChat.jsx`**: 职位详情页右下角的 AI 问答气泡。
*   **`components/ui/`**: 基础 UI 库 (Button, Card, Input 等)。

## 3. 脚本工具 (Root)
*   **`start_backend.py`**: 启动后端的快捷脚本。
*   **`seed_mock_data.py`**: 批量生成模拟数据 (职位、申请)。
*   **`create_admin.py`**: 创建管理员账号。
*   **`create_test_user.py`**: 创建测试用户账号。
