# 08. AI 智能化招聘全流程设计 (AI Recruitment Workflow Design)

**更新日期**: 2026-01-19  
**核心理念**: 本地与云端 (Coze) 深度协同，AI Agent 分工明确（预处理 vs 面试 vs 分析），全流程自动化。

---

## 1. 🤖 Agent 角色分工体系 (Agent Roles)

系统将划分为三个独立的 AI 职能，通过 API 和 Webhook 串联：

| Agent 名称 | 运行位置 | 核心职责 | 触发时机 |
| :--- | :--- | :--- | :--- |
| **预处理 Agent (Screening Agent)** | Coze 云端 | 简历初筛、提取结构化数据、生成面试题库、生成追问策略 | 用户投递简历后 |
| **面试官 Agent (Interviewer Agent)** | 本地/Coze | 实时语音对话、动态追问、节奏控制、上下文管理 | 面试开始时 |
| **分析师 Agent (Analyst Agent)** | Coze 云端 | 视频/音频分析、多维度评分、生成详细报告、飞书通知推送 | 面试结束后 |

---

## 2. 🔄 详细业务流程 (Detailed Workflow)

### 阶段一：智能预处理 (Intelligent Screening)
1.  **触发**: 用户在网站上传简历 (PDF) 并提交申请。
2.  **数据流**: 后端将简历文本/文件发送给 **预处理 Agent**。
3.  **Agent 处理**:
    *   **打分**: 根据职位 JD 对简历进行匹配度打分 (0-100)。
    *   **决策**: 若分数 > 阈值 (如 60分)，自动标记为“初筛通过”。
    *   **生成物料**:
        *   **面试手卡**: 针对该候选人的 5-8 个核心问题。
        *   **深挖策略**: 针对项目经历的技术栈追问点。
        *   **个人画像**: 提取的技术栈、项目经验摘要。
4.  **反馈**: Coze 将上述 JSON 数据回调给我们的后端，存入数据库。
5.  **通知**:
    *   系统自动发送邮件/站内信给候选人：“恭喜通过初筛，请选择面试时间”。
    *   候选人选择时间后，系统锁定 Slot。

### 阶段二：实时面试 (Live Interview)
1.  **准备**:
    *   面试前 5 分钟，系统发送短信/邮件提醒。
    *   **面试官 Agent** 预加载：候选人画像、面试手卡、追问策略。
2.  **进行中**:
    *   **语音流**: 前端通过 WebSocket 发送音频流 -> 后端/ASR 服务 -> 转为文本。
    *   **对话逻辑**:
        *   用户回答 -> STT (语音转文字) + 时间戳。
        *   发送给 Agent -> Agent 判断是否需要追问 (基于预生成的策略)。
        *   Agent 生成回复/下一个问题 -> TTS (文字转语音) -> 前端播放。
3.  **记录**: 全程录音录像，并生成带时间戳的字幕文件 (SRT/JSON)。

### 阶段三：总结与分析 (Summary & Reporting)
1.  **触发**: 面试结束 (用户离开或 Agent 判断结束)。
2.  **异步处理**:
    *   后端将 **完整对话记录 (Transcript)** 和 **视频流/关键帧** 上传给 **分析师 Agent**。
3.  **Agent 处理**:
    *   **多维度评分**: 技术深度、沟通能力、逻辑思维、文化匹配度。
    *   **风险评估**: 识别简历造假嫌疑、性格缺陷风险。
    *   **文档生成**:
        *   《面试评估详细报告》 (Markdown/HTML)
        *   《候选人能力雷达图》 (JSON)
    *   **通知推送**: 调用飞书 Bot 接口，向 HR 群发送卡片消息。
        *   *“🤖 面试完成通知：候选人张三（Java后端）得分 85。优点：并发经验丰富；风险：跳槽频繁。[点击查看详细报告]”*
4.  **数据中心**:
    *   点击飞书卡片链接 -> 跳转回我们系统的 **管理员后台 (Admin Dashboard)**。
    *   展示可视化图表、完整对话回顾、AI 建议录用结论。

---

## 3. 🛠️ 技术实现规划 (Technical Implementation)

### 3.1 数据库变更 (Database Schema)
需要扩展 `InterviewRecord` 表以存储复杂数据：
```python
class InterviewRecord(Base):
    # ... 现有字段
    # 新增字段
    pre_screening_result = Column(JSON) # 预处理结果：手卡、追问点
    transcript_with_timestamps = Column(JSON) # 带时间戳的对话记录
    analysis_report = Column(JSON) # 分析报告：雷达图数据、文字总结
    video_url = Column(String) # 录像回放地址
    risk_assessment = Column(Text) # 风险评估
    lark_message_id = Column(String) # 飞书消息关联 ID
```

### 3.2 接口规划 (API Roadmap)
*   `POST /webhook/coze/screening_result`: 接收 Coze 预处理结果的回调。
*   `POST /webhook/coze/analysis_result`: 接收 Coze 分析报告的回调。
*   `GET /admin/interviews/{id}/report`: 获取详细可视化报告数据。
*   `POST /interviews/{id}/schedule`: 候选人预约面试时间。

### 3.3 第三方集成
*   **ASR/TTS**: 阿里云/火山引擎 (实时性要求高)。
*   **飞书 Bot**: 配置 Webhook 发送富文本卡片。

---

## 4. 📝 下一步行动 (Next Steps)
1.  **数据库迁移**: 更新 `models.py` 添加上述 JSON 字段。
2.  **Webhook 开发**: 开发接收 Coze 回调的接口，打通“云端大脑”与“本地身体”的连接。
3.  **前端预约**: 开发“选择面试时间”的交互组件。
