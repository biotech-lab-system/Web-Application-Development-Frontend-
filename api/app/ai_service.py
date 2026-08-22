import json
import os
from typing import Any

from google import genai
from google.genai import types
from pydantic import BaseModel, Field


DEFAULT_MODEL = "gemini-3.6-flash"


class AIAnalysis(BaseModel):
    answer: str = Field(min_length=1)
    confidence: int = Field(ge=0, le=100)
    key_findings: list[str] = Field(default_factory=list, max_length=6)
    anomalies: list[str] = Field(default_factory=list, max_length=6)
    next_steps: list[str] = Field(default_factory=list, max_length=6)
    disclaimer: str = Field(min_length=1)


class GeminiServiceError(Exception):
    def __init__(self, message: str, status_code: int = 503):
        super().__init__(message)
        self.status_code = status_code


def gemini_config() -> dict[str, Any]:
    return {
        "configured": bool(os.getenv("GEMINI_API_KEY", "").strip()),
        "model": os.getenv("GEMINI_MODEL", DEFAULT_MODEL),
    }


def _client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise GeminiServiceError(
            "Gemini AI is not configured. Add GEMINI_API_KEY to the API environment.",
            503,
        )
    return genai.Client(api_key=api_key)


def _safe_service_error(error: Exception) -> GeminiServiceError:
    code = getattr(error, "code", None) or getattr(error, "status_code", None)
    text = str(error).lower()
    if code == 429 or "quota" in text or "rate limit" in text:
        return GeminiServiceError("Gemini rate limit reached. Please retry shortly.", 429)
    if code in {401, 403} or "api key" in text or "permission" in text:
        return GeminiServiceError("Gemini credentials are invalid or not permitted for this model.", 503)
    if code == 404 or "model" in text and "not found" in text:
        return GeminiServiceError("The configured Gemini model is unavailable. Update GEMINI_MODEL and retry.", 503)
    if "timeout" in text or "deadline" in text:
        return GeminiServiceError("Gemini did not respond in time. Please retry.", 504)
    return GeminiServiceError("Gemini could not complete the analysis. Please retry.", 502)


def generate_analysis(
    history: list[dict[str, str]],
    lab_context: dict[str, Any],
    attachments: list[dict[str, Any]],
) -> tuple[AIAnalysis, str]:
    config = gemini_config()
    model = str(config["model"])
    system_instruction = (
        "You are Helix Lab AI, a scientific decision-support assistant. Use only the laboratory "
        "records and attachments supplied in this request. Never invent measurements, citations, "
        "or experimental outcomes. Refer to record IDs when possible. State clearly when evidence "
        "is incomplete. Reply in the same language as the user's latest message. Keep conclusions "
        "concise and include a reminder that a qualified researcher must verify the output."
    )
    contents: list[types.Content] = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text="Laboratory context:\n" + json.dumps(lab_context, ensure_ascii=False, default=str)[:60_000])],
        ),
        types.Content(
            role="model",
            parts=[types.Part.from_text(text="I will use only this supplied laboratory context and clearly identify uncertainty.")],
        ),
    ]
    for index, item in enumerate(history[-20:]):
        parts = [types.Part.from_text(text=item["content"][:12_000])]
        if index == len(history[-20:]) - 1:
            for attachment in attachments:
                if attachment["kind"] == "binary":
                    parts.append(types.Part.from_bytes(data=attachment["data"], mime_type=attachment["mime_type"]))
                else:
                    parts.append(types.Part.from_text(text=f"Attachment {attachment['name']}:\n{attachment['text'][:35_000]}"))
        contents.append(types.Content(role="model" if item["role"] == "assistant" else "user", parts=parts))

    client = _client()
    try:
        response = client.models.generate_content(
            model=model,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.2,
                max_output_tokens=1800,
                response_mime_type="application/json",
                response_schema=AIAnalysis,
            ),
        )
        if getattr(response, "parsed", None):
            parsed = response.parsed
            analysis = parsed if isinstance(parsed, AIAnalysis) else AIAnalysis.model_validate(parsed)
        else:
            analysis = AIAnalysis.model_validate_json(response.text or "{}")
        return analysis, model
    except GeminiServiceError:
        raise
    except Exception as error:
        raise _safe_service_error(error) from error
    finally:
        client.close()


def generate_report_summary(snapshot: dict[str, Any], language: str) -> str:
    model = str(gemini_config()["model"])
    target_language = "Thai" if language == "th" else "English"
    prompt = (
        f"Write a concise laboratory report summary in {target_language}. Use only the JSON data "
        "provided. Do not invent measurements. Mention important statuses, missing evidence, and "
        "administrative quality exceptions. End with a short researcher-verification disclaimer.\n\n"
        + json.dumps(snapshot, ensure_ascii=False, default=str)[:60_000]
    )
    client = _client()
    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.2, max_output_tokens=1000),
        )
        text = (response.text or "").strip()
        if not text:
            raise GeminiServiceError("Gemini returned an empty report summary.", 502)
        return text
    except GeminiServiceError:
        raise
    except Exception as error:
        raise _safe_service_error(error) from error
    finally:
        client.close()
