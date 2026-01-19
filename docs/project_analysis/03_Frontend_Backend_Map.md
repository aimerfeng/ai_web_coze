# 03. 前后端对应关系图 (Frontend-Backend Map)

## 1. 页面路由与 API 映射

| 前端页面 (Route) | 组件 (Component) | 后端 API (Endpoint) | 功能描述 |
| :--- | :--- | :--- | :--- |
| `/login` | `Login.jsx` | `POST /auth/login` | 用户登录 (获取 JWT Token) |
| `/register` | `Register.jsx` | `POST /auth/register` | 用户注册 |
| `/jobs` | `JobBoard.jsx` | `GET /jobs` | 获取所有活跃职位列表 |
| `/jobs/:id` | `JobDetail.jsx` | `GET /jobs/{id}` | 获取单个职位详情 |
| `/apply/:id` | `ApplicationForm.jsx` | `POST /applications` | 提交职位申请 (含 Github 链接) |
| `/dashboard` | `Dashboard.jsx` | `GET /applications/me` | 用户查看自己的申请历史 |
| `/interview/:id` | `InterviewRoom.jsx` | **WebSocket** `/ws/interview` | **核心**: 实时音视频面试交互 |
| | `JobChat.jsx` (组件) | `POST /ai/chat` | 职位详情页的 AI 悬浮问答助手 |

## 2. 管理员后台映射

| 前端页面 (Route) | 组件 (Component) | 后端 API (Endpoint) | 功能描述 |
| :--- | :--- | :--- | :--- |
| `/admin/login` | `AdminLogin.jsx` | `POST /admin/login` | 管理员专用登录 (校验 role='admin') |
| `/admin/jobs` | `AdminJobs.jsx` | `GET /jobs` | 职位管理列表 |
| `/admin/jobs/new` | `AdminJobCreate.jsx` | `POST /jobs` | **[Admin Only]** 发布新职位 |
| `/admin/candidates`| `AdminCandidates.jsx`| *(Mock Data)* | 候选人看板 (目前前端使用 Mock 数据，需对接 API) |
| `/admin/settings` | `AdminSettings.jsx` | *(Local State)* | 系统配置 (目前仅前端展示) |

## 3. 关键连接点说明

### A. 认证连接 (`AuthContext`)
*   前端登录成功后，将 Token 存入 `localStorage`。
*   后续所有请求（如申请职位）都会在 Header 中携带 `Authorization: Bearer {token}`。
*   后端 `auth.get_current_user` 依赖项会解析此 Token，从而知道是谁在操作。

### B. 实时面试连接 (`InterviewController`)
*   这是系统最复杂的部分。
*   **前端**: `InterviewRoom` 通过 WebSocket 发送 JSON (事件) 和 Binary (音频/视频)。
*   **后端**: `main.py` 接收 WS 连接 -> 转交给 `controller.py`。
*   **Controller**:
    *   收到视频 -> 调 `Observer` 分析。
    *   收到音频 -> 调 `STT` -> 调 `Coze` -> 调 `TTS` -> 发回前端。

## 4. 缺失的链接 (Missing Links)
1.  **管理员候选人列表**: `AdminCandidates.jsx` 目前使用的是前端写死的 `const [candidates] = useState([...])`，没有调用后端 API。
    *   *需补充*: `GET /admin/applications` 接口。
2.  **管理员设置**: `AdminSettings.jsx` 的配置目前保存在前端 State 中，刷新即失。
    *   *需补充*: 数据库 `settings` 表及对应 API。
3.  **简历文件上传**: `ApplicationForm.jsx` 目前只模拟了文件选择，没有真正的文件上传接口。
    *   *需补充*: `POST /upload` 接口及文件存储服务 (S3/本地)。
