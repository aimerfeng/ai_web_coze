import asyncio
import json
import random

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
