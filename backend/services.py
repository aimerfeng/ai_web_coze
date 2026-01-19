import asyncio
import json
import random
import os
from company_knowledge import COMPANY_INFO, SYSTEM_PERSONA

class DeepSeekService:
    def __init__(self):
        self.api_key = os.getenv("DEEPSEEK_API_KEY", "sk-placeholder")
        self.api_url = "https://api.deepseek.com/v1/chat/completions" # Example URL

    async def chat(self, history: list) -> str:
        """
        Call DeepSeek API with RAG context.
        """
        # 1. Construct System Prompt with Knowledge Base
        system_prompt = SYSTEM_PERSONA.format(company_info=COMPANY_INFO)
        
        # 2. Prepare Messages
        messages = [{"role": "system", "content": system_prompt}] + history

        # 3. Call API (Mock for now)
        await asyncio.sleep(1.5) # Simulate thinking time
        
        last_user_msg = history[-1]['content'] if history else ""
        
        # Mock Logic based on keywords
        if "你好" in last_user_msg:
            return "你好呀！我是 TechFuture 的 AI 招聘顾问 DeepHR。很高兴见到你！\n\n你可以问我关于公司福利、部门介绍，或者让我帮你分析适合什么岗位。"
        elif "福利" in last_user_msg:
            return "咱们公司的福利可是相当不错的！\n\n💻 **硬件**: 全员顶配 MacBook Pro + 4K 显示器。\n🏖️ **假期**: 15天带薪年假 + 12天带薪病假。\n🍎 **吃喝**: 免费三餐下午茶，零食管够！\n\n怎么样，是不是很心动？"
        elif "后端" in last_user_msg or "Python" in last_user_msg:
            return "听起来你是技术大牛！\n\n我们的 **研发中心 (R&D)** 非常适合你。我们正在寻找热爱 Python、FastAPI 和高并发系统的后端工程师。如果你喜欢挑战技术难题，这里绝对是你的乐园。"
        elif "产品" in last_user_msg:
            return "产品经理看过来！\n\n我们的 **产品中心** 正在热招 B 端和 C 端的产品经理。我们需要你有敏锐的市场洞察力，能把复杂的技术变成好用的产品。"
        else:
            return "这是一个很好的问题。作为一家追求极客精神的公司，我们非常看重每一位候选人的潜力。\n\n你可以告诉我你擅长什么技能（比如 Python, 设计, 运营），我可以帮你推荐最适合的岗位哦！"

class CozeService:
    async def chat(self, session_id: str, message: str, context: dict = None):
        """
        Mock Coze API call.
        In production, use requests.post to Coze API endpoint.
        """
        await asyncio.sleep(1) # Simulate network latency
        
        if message == "START_INTERVIEW":
            return "你好，我是你的AI面试官。首先请做一个自我介绍。"
            
        # Mock logic
        responses = [
            '{"reply": "收到，关于你提到的项目难点，能具体说说是怎么解决并发问题的吗？", "action": "FOLLOW_UP"}',
            '{"reply": "好的，非常有意思。那么你对Python的GIL锁有什么理解？", "action": "NEXT_QUESTION"}',
            '{"reply": "明白了。最后，你有什么想问我的吗？", "action": "NEXT_QUESTION"}'
        ]
        return random.choice(responses)

class TTSService:
    async def synthesize(self, text: str) -> bytes:
        """
        Mock TTS. Returns dummy bytes.
        In production, use edge-tts or OpenAI API.
        """
        # await asyncio.sleep(0.5)
        # return b'\x00' * 1024 # Dummy audio
        
        # If edge-tts is installed and we want to try real TTS:
        try:
            import edge_tts
            communicate = edge_tts.Communicate(text, "zh-CN-YunxiNeural")
            audio_data = bytearray()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_data.extend(chunk["data"])
            return bytes(audio_data)
        except Exception:
            return b'\x00' * 1024

class STTService:
    async def transcribe(self, audio_bytes: bytes) -> str:
        """
        Mock STT.
        In production, send audio_bytes to Groq/Whisper API.
        """
        await asyncio.sleep(0.5)
        return "模拟的用户回答内容...我使用了Redis锁来解决这个问题。"
