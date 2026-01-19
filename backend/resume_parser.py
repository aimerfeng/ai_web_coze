import re
from typing import Any, Dict, List, Optional

from pypdf import PdfReader

from llm_provider import create_llm_provider


class ResumeParser:
    def __init__(self):
        self.llm = create_llm_provider()

    def parse_pdf(self, file_path: str) -> Dict[str, Any]:
        text_chunks: List[str] = []
        reader = PdfReader(file_path)
        for page in reader.pages:
            page_text = page.extract_text() or ""
            if page_text:
                text_chunks.append(page_text)
        text = "\n".join(text_chunks).strip()
        return self._extract_structured_data(text)

    def _extract_structured_data(self, text: str) -> Dict[str, Any]:
        normalized = self._normalize_text(text)
        result: Dict[str, Any] = {
            "basics": {},
            "skills": [],
            "education": [],
            "experience": [],
            "awards": [],
            "raw_text_preview": normalized[:800]
        }

        email = self._extract_email(normalized)
        phone = self._extract_phone(normalized)
        if email:
            result["basics"]["email"] = email
        if phone:
            result["basics"]["phone"] = phone

        skills = self._extract_skills(normalized)
        if skills:
            result["skills"] = skills

        education = self._extract_education(normalized)
        if education:
            result["education"] = education

        experience = self._extract_experience(normalized)
        if experience:
            result["experience"] = experience

        return result

    def _normalize_text(self, text: str) -> str:
        t = text.replace("\u00a0", " ")
        t = re.sub(r"[ \t]+", " ", t)
        t = re.sub(r"\n{3,}", "\n\n", t)
        return t.strip()

    def _extract_email(self, text: str) -> Optional[str]:
        m = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
        return m.group(0) if m else None

    def _extract_phone(self, text: str) -> Optional[str]:
        m = re.search(r"(?:\+?86[- ]?)?(1[3-9]\d{9})", text)
        return m.group(1) if m else None

    def _extract_skills(self, text: str) -> List[str]:
        keywords = [
            "Python",
            "Java",
            "Go",
            "C++",
            "SQL",
            "React",
            "Vue",
            "Node.js",
            "FastAPI",
            "Django",
            "Spring",
            "Docker",
            "Kubernetes",
            "AWS",
            "GCP",
            "Azure",
            "Redis",
            "PostgreSQL",
            "MySQL",
            "MongoDB",
            "LLM",
            "RAG"
        ]
        found: List[str] = []
        for kw in keywords:
            pattern = r"\b" + re.escape(kw).replace("\\.", r"\.") + r"\b"
            if re.search(pattern, text, re.IGNORECASE):
                found.append(kw)
        seen = set()
        deduped = []
        for s in found:
            k = s.lower()
            if k in seen:
                continue
            seen.add(k)
            deduped.append(s)
        return deduped

    def _extract_education(self, text: str) -> List[Dict[str, Any]]:
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        edu_lines = []
        triggers = ["大学", "学院", "University", "College", "Bachelor", "Master", "PhD", "学士", "硕士", "博士", "研究生"]
        for line in lines:
            if len(line) > 80:
                continue
            if any(t in line for t in triggers):
                edu_lines.append(line)
        items: List[Dict[str, Any]] = []
        for line in edu_lines[:6]:
            degree = self._guess_degree(line)
            items.append({"school": line, "degree": degree, "major": "", "startDate": "", "endDate": ""})
        return items

    def _guess_degree(self, line: str) -> str:
        if "博士" in line or "PhD" in line:
            return "博士"
        if "硕士" in line or "Master" in line or "研究生" in line:
            return "硕士"
        if "学士" in line or "Bachelor" in line:
            return "本科"
        if "高中" in line:
            return "高中"
        return ""

    def _extract_experience(self, text: str) -> List[Dict[str, Any]]:
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        date_pat = r"(20\d{2}[./-](?:0?[1-9]|1[0-2])|20\d{2})\s*(?:[-~—–至]\s*)?(20\d{2}[./-](?:0?[1-9]|1[0-2])|20\d{2}|至今|Present)?"
        items: List[Dict[str, Any]] = []
        for i, line in enumerate(lines[:200]):
            if re.search(date_pat, line):
                company = line
                title = ""
                if i + 1 < len(lines):
                    nxt = lines[i + 1]
                    if len(nxt) <= 40 and not re.search(date_pat, nxt):
                        title = nxt
                items.append({"company": company, "title": title, "startDate": "", "endDate": "", "description": ""})
            if len(items) >= 6:
                break
        return items
