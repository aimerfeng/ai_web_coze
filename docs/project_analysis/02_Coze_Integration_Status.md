# 02. Coze 编排接入状态 (Coze Integration Status)

## ⚠️ 当前状态：模拟模式 (Mock Mode)

目前项目中的 Coze 接入处于 **模拟 (Mock)** 状态。这意味着代码结构已经就绪，但并没有真正向字节跳动 Coze 平台发送 HTTP 请求。

### 1. 现有代码分析 (`backend/services.py`)

```python
class CozeService:
    async def chat(self, session_id: str, message: str, context: dict = None):
        """
        Mock Coze API call.
        """
        await asyncio.sleep(1) # 模拟网络延迟
        
        # 硬编码的回复逻辑
        if message == "START_INTERVIEW":
            return "你好，我是你的AI面试官。首先请做一个自我介绍。"
            
        # 随机回复
        responses = [...]
        return random.choice(responses)
```

### 2. 为什么现在是 Mock？
*   **开发便利性**: 在开发前端界面时，使用 Mock 可以避免消耗 Coze API 的 Token 额度。
*   **稳定性**: 避免因网络波动影响开发进度。

### 3. 如何接入真实的 Coze Agent？

要实现真正的 "云端大脑"，您需要执行以下步骤修改 `backend/services.py`：

#### 第一步：获取 Coze API 信息
1.  登录 [Coze 平台](https://www.coze.cn/)。
2.  创建一个 Bot (智能体)，并发布为 API 服务。
3.  获取 **Bot ID** 和 **Personal Access Token (PAT)**。

#### 第二步：修改代码
将 `CozeService` 类替换为真实调用逻辑：

```python
import requests

class CozeService:
    def __init__(self):
        self.api_url = "https://api.coze.cn/open_api/v2/chat"
        self.bot_id = "YOUR_REAL_BOT_ID"
        self.token = "YOUR_REAL_PAT_TOKEN"

    async def chat(self, session_id: str, message: str, context: dict = None):
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Host": "api.coze.cn",
            "Connection": "keep-alive"
        }
        
        payload = {
            "conversation_id": session_id, # 保持上下文的关键
            "bot_id": self.bot_id,
            "user": "candidate_user",
            "query": message,
            "stream": False
        }
        
        # 真实请求
        response = requests.post(self.api_url, headers=headers, json=payload)
        if response.status_code == 200:
            data = response.json()
            # 解析 Coze 返回的 content
            return data['messages'][0]['content']
        else:
            return "（AI 服务暂时不可用，请检查连接）"
```

### 4. RAG (知识库) 的链接逻辑
目前我们在数据库 `Job` 表中存储了 `knowledge_base` 字段。
*   **未链接**: 目前这个字段只是存储在本地数据库。
*   **如何链接**: 在调用 Coze API 时，可以将 `job.knowledge_base` 作为 Prompt 的一部分发送过去，或者（更高级地）在 Coze 平台侧上传知识库，然后通过 Bot ID 自动关联。

**建议方案**:
在 `START_INTERVIEW` 阶段，将职位的 JD 和知识库作为 System Prompt 发送给 Coze，让它"扮演"这个职位的面试官。
