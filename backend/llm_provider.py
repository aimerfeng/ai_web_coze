import os
from typing import Any, Dict, Optional


class LLMProvider:
    async def extract_resume(self, text: str) -> Dict[str, Any]:
        raise NotImplementedError


class DeepSeekProvider(LLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def extract_resume(self, text: str) -> Dict[str, Any]:
        raise NotImplementedError


class ClaudeProvider(LLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def extract_resume(self, text: str) -> Dict[str, Any]:
        raise NotImplementedError


def create_llm_provider() -> Optional[LLMProvider]:
    provider = (os.getenv("LLM_PROVIDER") or "").strip().lower()
    api_key = (os.getenv("LLM_API_KEY") or "").strip()
    if not provider or provider == "none":
        return None
    if not api_key:
        return None
    if provider == "deepseek":
        return DeepSeekProvider(api_key=api_key)
    if provider == "claude":
        return ClaudeProvider(api_key=api_key)
    return None

