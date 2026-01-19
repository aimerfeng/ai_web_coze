# 07. 第二阶段任务规划表 (Phase 2 Task Roadmap)

**当前状态**: MVP (最小可行性产品) 已完成，核心功能跑通，但 AI 为模拟状态，后端代码结构开始臃肿。  
**本阶段目标**: 从 "演示 Demo" 进化为 "可用的 Beta 版本"，完成真实 AI 接入与架构重构。

---

## 📅 任务优先级总览 (Priority Overview)

建议按照以下顺序执行，先稳固地基（重构），再盖高楼（AI 接入），最后精装修（UI/UX）。

| 优先级 | 任务模块 | 核心内容 | 预计耗时 | 原因 |
| :--- | :--- | :--- | :--- | :--- |
| **P0 (最高)** | **后端重构** | 拆分 `main.py` 为模块化路由 | 1-2 小时 | 代码已达 450+ 行，再不拆分后续开发将极难维护。 |
| **P1** | **安全加固** | 环境变量管理、文件上传校验 | 1 小时 | 修复审计中发现的 Secret Key 和文件上传漏洞，防止安全事故。 |
| **P2** | **AI 核心接入** | 对接 DeepSeek/Coze 真实 API | 2-3 小时 | 项目的核心价值。替换 Mock 数据，让简历解析和聊天具备真实智能。 |
| **P3** | **功能补全** | 真实邮件发送、面试报告生成 | 2 小时 | 完善用户注册闭环和面试后的反馈环节。 |
| **P4** | **部署准备** | Docker 化、数据库迁移 | 2 小时 | 为上线云服务器做准备。 |

---

## 📝 详细任务清单 (Detailed Task List)

### 1. 🏗️ 后端架构重构 (Backend Refactoring) - P0
> **目标**: 消除 "上帝对象" `main.py`，实现模块化。

- [ ] **创建路由目录结构**:
  - `backend/routers/auth.py` (登录/注册)
  - `backend/routers/jobs.py` (职位管理)
  - `backend/routers/applications.py` (投递与简历)
  - `backend/routers/users.py` (个人信息)
  - `backend/routers/ai.py` (AI 聊天与解析)
- [ ] **迁移逻辑**: 将 `main.py` 中的端点函数移动到对应文件。
- [ ] **依赖注入更新**: 确保 `get_db` 和 `get_current_user` 在新模块中正常工作。
- [ ] **主文件瘦身**: `main.py` 只保留 FastAPI 实例创建、CORS 配置和路由注册 (`app.include_router(...)`)。

### 2. 🛡️ 安全与配置加固 (Security) - P1
> **目标**: 修复审计报告中的高危漏洞。

- [ ] **环境变量强制检查**:
  - 启动时检查 `.env` 文件。
  - 如果缺失 `SECRET_KEY` 或 `LLM_API_KEY`，阻止服务器启动并报错提示。
- [ ] **文件上传安全**:
  - 引入 `python-magic` 或类似库。
  - 在 `parse_resume` 和 `submit_application` 中验证文件头是否为 PDF，拒绝伪装的 `.exe` 文件。
- [ ] **CORS 限制**: 将 `allow_origins=["*"]` 改为读取环境变量 `FRONTEND_URL` (开发环境可保留 *)。

### 3. 🧠 AI 真实接入 (AI Integration) - P2
> **目标**: 让系统真正 "智能" 起来。

- [ ] **DeepSeek 简历解析**:
  - 完善 `backend/llm_provider.py` 中的 `DeepSeekProvider`。
  - 构造 Prompt：让 AI 提取 JSON 格式的 技能、教育、工作经历。
  - 联调：在前端上传简历，验证是否能通过真实 API 自动填表。
- [ ] **Coze 职位问答**:
  - 注册 Coze Bot 并获取 API Key / Bot ID。
  - 在 `backend/routers/ai.py` 中实现对 Coze API 的流式调用 (Streaming) 或普通调用。
  - 替换前端 `JobChat.jsx` 的 Mock 数据源。

### 4. 📧 功能补全 (Feature Completion) - P3
> **目标**: 填补流程中的缺失环节。

- [ ] **邮件服务集成**:
  - 注册 SMTP 服务 (如 QQ 邮箱 SMTP 或 SendGrid)。
  - 替换 `auth.py` 中的 Mock 邮件发送逻辑，发送真实的 6 位数验证码。
- [ ] **面试报告生成**:
  - 在面试结束时 (WebSocket 断开或点击结束)，触发后台任务。
  - 将 `transcript` (对话记录) 发送给 LLM，生成 "面试表现总结" 和 "评分"。
  - 存入 `InterviewRecord` 表并在前端展示。

### 5. 🎨 UI/UX 优化 (Polish) - P4
> **目标**: 提升专业度。

- [ ] **全局 Loading 状态**: 优化 API 请求时的加载动画，避免页面闪烁。
- [ ] **统一错误处理**: 拦截 401/403 错误，自动跳转登录页或刷新 Token。
- [ ] **移动端适配检查**: 确保简历上传和个人中心在手机端显示正常。

---

## 🚀 建议执行路线 (Execution Path)

**我建议我们立刻开始 "任务 1: 后端架构重构"。**

**理由**:
1.  现在的 `main.py` 已经很乱了，如果先加 AI 逻辑，代码会变得更难以管理。
2.  重构是 "无痛" 的（不改变功能），但能让后续加 AI 功能快 2 倍。
3.  这符合软件工程的最佳实践：**先整理，再扩张**。

**您同意先从拆分 `main.py` 开始吗？**
