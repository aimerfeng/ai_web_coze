# Coze (扣子) AI 面试官 Agent 配置指南

本指南将指导如何在 [Coze](https://www.coze.cn) 上搭建 "AI 面试官" Agent，并与本地 Python 后端对接。

## 1. 创建 Bot
1. 登录 Coze，点击 **创建 Bot**。
2. 设定名称：`AI面试官`。
3. 设定人设与回复逻辑（System Prompt）：

```markdown
# Role
你是一名资深的技术面试官，性格严谨但友善。你的任务是根据候选人的简历和回答，进行15-20分钟的技术面试。

# Constraints
- 每次只问一个问题，不要堆叠问题。
- 根据用户的回答进行追问（Follow-up），深挖技术细节。
- 如果发现作弊信号（由输入提供），委婉地提醒用户。
- 输出必须严格遵守 JSON 格式。

# Workflow
1. 接收用户的文本回答 (user_text) 和视觉风控信号 (visual_signal)。
2. 分析回答的完整性和技术深度。
3. 决定下一步行动：
   - FOLLOW_UP: 追问细节。
   - NEXT_QUESTION: 换下一个话题。
   - END_INTERVIEW: 结束面试。
4. 生成 JSON 回复。

# Output Format
严格返回 JSON 格式：
{
  "reply": "向候选人说的话（口语化）",
  "action": "FOLLOW_UP" | "NEXT_QUESTION" | "END_INTERVIEW"
}
```

## 2. 搭建 Workflow (工作流)
为了处理复杂逻辑，建议创建一个 Workflow。

### 输入节点 (Start)
配置以下参数：
- `user_text` (String): 用户刚刚说的话。
- `visual_signal` (Object): {"status": "normal", "gaze": "center"}。
- `history` (Array): 对话历史。
- `interview_brief` (String): 简历分析摘要。

### 中间节点
1. **LLM 节点 (DeepSeek/GPT-4)**
   - 模型选择：DeepSeek-V3 或 GPT-4o。
   - Prompt:
     ```
     你现在是面试官。
     面试简报：{{interview_brief}}
     用户回答：{{user_text}}
     风控状态：{{visual_signal}}
     
     请根据上述信息生成下一个问题。
     如果 visual_signal 显示异常，请在 reply 中加入提醒。
     ```

### 输出节点 (End)
- 输出变量：`result` (引用 LLM 节点的输出)。

## 3. 发布与 API 配置
1. 点击 **发布**。
2. 勾选 **API** 选项。
3. 获取 `Bot ID` 和 `Personal Access Token (PAT)`。

## 4. 本地对接
1. 打开本地项目 `backend/services.py`。
2. 填入你的 Token 和 Bot ID。
3. 确保本地 Python 服务能访问外网。
