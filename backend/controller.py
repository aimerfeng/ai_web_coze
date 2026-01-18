import asyncio
import json
import logging
import time
from typing import Dict
from fastapi import WebSocket
from observer import ObserverAgent
from services import CozeService, TTSService, STTService

logger = logging.getLogger("controller")

class InterviewController:
    def __init__(self):
        self.connections: Dict[str, WebSocket] = {}
        self.states: Dict[str, str] = {}  # IDLE, LISTENING, PROCESSING, SPEAKING
        self.observer = ObserverAgent()
        self.coze = CozeService()
        self.tts = TTSService()
        self.stt = STTService()
        self.audio_buffers: Dict[str, bytearray] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        self.connections[session_id] = websocket
        self.states[session_id] = "IDLE"
        self.audio_buffers[session_id] = bytearray()
        logger.info(f"Session {session_id} connected")

    def disconnect(self, session_id: str):
        if session_id in self.connections:
            del self.connections[session_id]
        if session_id in self.states:
            del self.states[session_id]
        if session_id in self.audio_buffers:
            del self.audio_buffers[session_id]

    async def handle_event(self, session_id: str, data: dict):
        event_type = data.get("type")
        
        if event_type == "START_INTERVIEW":
            await self.start_interview(session_id, data.get("payload"))
        elif event_type == "USER_FINISHED_SPEAKING":
            await self.process_user_response(session_id)
        elif event_type == "VIDEO_FRAME":
            # Pass to Observer Agent (async)
            asyncio.create_task(self.observer.analyze_frame(session_id, data.get("payload")))

    async def handle_audio_stream(self, session_id: str, audio_chunk: bytes):
        if self.states.get(session_id) == "LISTENING":
            self.audio_buffers[session_id].extend(audio_chunk)
            # Optional: Implement VAD here to auto-detect silence
            # if vad.is_silence(audio_chunk): ...

    async def start_interview(self, session_id: str, candidate_info: dict):
        self.states[session_id] = "PROCESSING"
        
        # 1. Generate Context (Profiler Agent - Mocked)
        logger.info(f"Generating profile for {candidate_info.get('name')}")
        
        # 2. Wake up Coze Agent
        intro_text = await self.coze.chat(session_id, "START_INTERVIEW", candidate_info)
        
        # 3. TTS
        audio_content = await self.tts.synthesize(intro_text)
        
        # 4. Send Audio + Text to Client
        await self.send_response(session_id, intro_text, audio_content)
        self.states[session_id] = "LISTENING"

    async def process_user_response(self, session_id: str):
        if self.states[session_id] != "LISTENING":
            return
            
        self.states[session_id] = "PROCESSING"
        
        # 1. Notify Client to show "Thinking" state
        await self.send_json(session_id, {"type": "STATE_CHANGE", "state": "THINKING"})
        
        # 2. STT (Convert audio buffer to text)
        audio_data = self.audio_buffers[session_id]
        user_text = await self.stt.transcribe(audio_data)
        self.audio_buffers[session_id] = bytearray() # Clear buffer
        
        logger.info(f"User said: {user_text}")
        
        # 3. Get Observer Risk Report
        risk_log = self.observer.get_latest_report(session_id)
        
        # 4. Coze Agent (The Brain)
        coze_payload = {
            "user_text": user_text,
            "visual_signal": risk_log,
            "history": [] # Maintain history if needed, or Coze does it
        }
        
        ai_response = await self.coze.chat(session_id, user_text, coze_payload)
        
        # 5. Parse AI Response (JSON)
        # Assuming Coze returns JSON string like {"reply": "...", "action": "..."}
        try:
            # For robustness, handle if it's just text
            if isinstance(ai_response, str) and ai_response.strip().startswith("{"):
                response_data = json.loads(ai_response)
                reply_text = response_data.get("reply", "Error parsing response")
                action = response_data.get("action", "NEXT_QUESTION")
            else:
                reply_text = ai_response
                action = "NEXT_QUESTION"
        except:
            reply_text = ai_response
            action = "NEXT_QUESTION"
            
        # 6. TTS
        audio_content = await self.tts.synthesize(reply_text)
        
        # 7. Send back
        await self.send_response(session_id, reply_text, audio_content)
        
        if action == "END_INTERVIEW":
            self.states[session_id] = "FINISHED"
            await self.send_json(session_id, {"type": "INTERVIEW_END"})
        else:
            self.states[session_id] = "LISTENING"

    async def send_response(self, session_id: str, text: str, audio: bytes):
        ws = self.connections.get(session_id)
        if ws:
            # Send text metadata first
            await ws.send_json({
                "type": "AI_RESPONSE",
                "text": text
            })
            # Send audio binary
            if audio:
                await ws.send_bytes(audio)

    async def send_json(self, session_id: str, data: dict):
        ws = self.connections.get(session_id)
        if ws:
            await ws.send_json(data)
