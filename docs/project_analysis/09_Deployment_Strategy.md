# 09. 部署方案决策分析与指南 (Deployment Strategy)

**日期**: 2026-01-19  
**目标**: 分析项目特性，确定最佳部署方案，并提供从本地到云端的落地路径。

---

## 1. ⚖️ 核心决策：云部署 vs 本地部署

针对您的项目（AI 招聘平台，含实时语音面试），我的**强烈建议**是：

### 🏆 推荐方案：混合云部署 (Hybrid Cloud Deployment)
**"开发在本地，服务在云端，AI 在大模型"**

*   **为什么选云部署？**
    1.  **WebRTC 实时面试**: 语音/视频通话对网络环境要求高。如果部署在本地（内网），外网用户（应聘者）无法访问，或者需要极其复杂的内网穿透配置（NAT/STUN/TURN）。云服务器有公网 IP，天生解决连通性问题。
    2.  **Webhook 回调**: 您的 Coze Agent 需要调用后端接口 (`/webhook/...`)。Coze 的服务器在公网，无法直接访问您家里的 `localhost`。虽然可以用 Ngrok，但不稳定且不适合生产。
    3.  **24/7 在线**: 招聘平台需要随时可访问，不能因为您关电脑了服务就停了。

*   **为什么不完全本地部署？**
    *   **限制**: 仅适合个人演示或纯内网企业使用。一旦涉及外部候选人，本地部署的局限性就暴露无遗。

---

## 2. ☁️ 云部署实战指南 (How-to)

假设您购买了一台云服务器（阿里云/腾讯云/AWS，推荐 Ubuntu 22.04 LTS）。

### 2.1 架构设计
*   **前端**: 构建为静态文件 (`dist/`)，使用 **Nginx** 托管。
*   **后端**: 使用 **Docker** 容器运行 FastAPI，或者用 Systemd 守护进程。
*   **数据库**: 既然是 MVP，继续用 **SQLite** (文件版) 最简单，或者上 Docker 版 PostgreSQL。
*   **反向代理**: Nginx 作为统一入口，转发 `/api` 到后端，`/ws` 到后端，其他请求给前端。

### 2.2 部署流程 (Step-by-Step)

#### 第一步：容器化 (在本地完成)
这是连接本地与云端的桥梁。我们不应该在云服务器上手动 pip install，环境会乱。

1.  **编写 Dockerfile** (我稍后为您生成)：
    *   将前端构建 (`npm run build`) 和后端代码打包进一个镜像。
    *   或者分为两个镜像（更推荐，解耦）。

2.  **编写 docker-compose.yml**：
    *   定义服务编排：Frontend + Backend + Nginx。

#### 第二步：代码同步
*   **Git**: 在云服务器上 `git clone` 您的仓库。
*   **GitHub Actions (进阶)**: 配置自动部署，您一 push，云端自动拉取并重启。

#### 第三步：云端启动
```bash
# 在云服务器上
git pull
docker-compose up -d --build
```
就这么简单。

### 2.3 如何调试？(Local vs Cloud)

您问到了关键点：**本地调试好的结构，在云端怎么调？**

**策略：环境一致性 (Environment Parity)**

1.  **本地模拟云端**:
    *   在本地也使用 `docker-compose up` 启动服务，而不是分别开两个终端跑 `npm run dev` 和 `python main.py`。
    *   如果 Docker 在本地跑通了，在云端 99% 也能跑通。这是 Docker 的最大价值。

2.  **环境变量隔离**:
    *   使用 `.env` 文件区分配置。
    *   本地 `.env`: `API_URL=http://localhost:8000`
    *   云端 `.env`: `API_URL=https://your-domain.com/api`

3.  **日志监控**:
    *   云端报错了？使用 `docker logs -f backend` 实时看日志，就像在本地终端看一样。

---

## 3. 📝 下一步行动建议

为了让您能够丝滑地过渡到云部署，我建议现在立即执行以下 **"云就绪" (Cloud Readiness)** 任务：

1.  **创建 Docker 配置**:
    *   `Dockerfile.backend`
    *   `Dockerfile.frontend`
    *   `docker-compose.yml`
    *   `nginx.conf` (处理路由转发)
2.  **测试 Docker 启动**: 在您现在的本地环境中，尝试用 Docker 启动项目。如果成功，您就拥有了“随时随地部署”的能力。

**您同意我为您生成这一套 Docker 配置文件吗？**
