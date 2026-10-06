import asyncio
import json
import logging
from typing import Optional, List
from pydantic import BaseModel, Field
from tenacity import retry, stop_after_attempt, wait_exponential_jitter, retry_if_exception_type

from google import genai
from google.genai import types
from google.genai.errors import APIError

from config import settings
from analyzers.base import BaseAnalyzer
from analyzers.prompts import SYSTEM_PROMPT, build_analysis_prompt
from models.clause import AnalysisResult, Clause, RiskType
from models.exceptions import GeminiAPIError, ResponseParseError

logger = logging.getLogger("clauselens.gemini_analyzer")

# Schemas for Gemini Developer API compatibility (avoids additionalProperties dictionary issues)
class GeminiClauseSchema(BaseModel):
    id: str = Field(description="Unique clause identifier e.g. 'clause-1'")
    text: str = Field(description="EXACT verbatim substring from original contract text")
    type: RiskType = Field(description="Risk classification: danger, warning, or safe")
    category: str = Field(description="Category name from the 6 risk categories")
    title: str = Field(description="Short human-readable title e.g. 'Unlimited Liability'")
    explanation: str = Field(description="Plain-language explanation of risk")
    counterclause: str = Field(description="Suggested fair alternative clause text")

class RiskCountsSchema(BaseModel):
    danger: int = Field(default=0, description="Count of danger clauses")
    warning: int = Field(default=0, description="Count of warning clauses")
    safe: int = Field(default=0, description="Count of safe clauses")

class CategoryScoreSchema(BaseModel):
    category: str = Field(description="Risk category name")
    score: int = Field(ge=0, le=100, description="Category fairness score out of 100")

class GeminiAnalysisSchema(BaseModel):
    overall_score: int = Field(ge=0, le=100, description="Fairness score 0-100")
    summary: str = Field(description="2-3 sentence executive summary")
    risk_counts: RiskCountsSchema = Field(description="Counts by risk level")
    category_scores: List[CategoryScoreSchema] = Field(description="Category scores list")
    key_takeaways: List[str] = Field(description="Key bullet points")
    clauses: List[GeminiClauseSchema] = Field(description="Flagged clauses list")


class TransientGeminiError(Exception):
    """Internal exception to trigger tenacity retries on temporary 429/5xx errors."""
    pass


class GeminiAnalyzer(BaseAnalyzer):
    """
    Google Gemini API analysis engine using `google-genai` SDK.
    Enforces Pydantic `response_schema` and `application/json` output.
    Includes retries, timeout management, and strict error classification.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.gemini_api_key

    async def analyze(
        self,
        contract_text: str,
        contract_type: Optional[str] = None
    ) -> AnalysisResult:
        """Execute Gemini AI contract audit."""
        if not self.api_key:
            raise GeminiAPIError("No Gemini API key provided or configured.", auth_failed=True)

        logger.info(f"Calling Gemini API with model '{settings.gemini_model}'...")
        prompt = build_analysis_prompt(contract_text, contract_type)

        try:
            # Wrap API call with timeout
            result = await asyncio.wait_for(
                self._call_gemini_with_retry(prompt),
                timeout=settings.gemini_timeout_seconds
            )
            return result
        except asyncio.TimeoutError:
            logger.error("Gemini API call timed out.")
            raise GeminiAPIError("Gemini API request timed out.", timeout=True)

    @retry(
        wait=wait_exponential_jitter(initial=1, max=10),
        stop=stop_after_attempt(3),
        retry=retry_if_exception_type((TransientGeminiError,)),
        reraise=True
    )
    async def _call_gemini_with_retry(self, prompt: str) -> AnalysisResult:
        """Execute Gemini SDK call in threadpool with exponential backoff on transient errors."""
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, self._execute_sdk_call, prompt)

    def _execute_sdk_call(self, prompt: str) -> AnalysisResult:
        """Synchronous SDK call executed in worker thread."""
        try:
            client = genai.Client(api_key=self.api_key)
            
            response = client.models.generate_content(
                model=settings.gemini_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    response_schema=GeminiAnalysisSchema,
                    temperature=0.2,
                )
            )

            # Check response safety candidates
            if response.candidates and hasattr(response.candidates[0], "finish_reason"):
                finish_reason = str(response.candidates[0].finish_reason)
                if "SAFETY" in finish_reason.upper():
                    logger.error(f"Gemini API blocked response due to safety filter: {finish_reason}")
                    raise GeminiAPIError("Gemini content safety filter triggered.", safety_blocked=True)

            if not response.text:
                raise ResponseParseError("Gemini API returned an empty response.")

            # Parse JSON schema and convert to domain AnalysisResult
            data = json.loads(response.text)
            parsed_schema = GeminiAnalysisSchema.model_validate(data)
            
            domain_clauses = [
                Clause(
                    id=c.id,
                    text=c.text,
                    type=c.type,
                    category=c.category,
                    title=c.title,
                    explanation=c.explanation,
                    counterclause=c.counterclause,
                    start_offset=-1,
                    end_offset=-1
                )
                for c in parsed_schema.clauses
            ]

            category_scores_map = {cs.category: cs.score for cs in parsed_schema.category_scores}

            return AnalysisResult(
                overall_score=parsed_schema.overall_score,
                summary=parsed_schema.summary,
                risk_counts={
                    "danger": parsed_schema.risk_counts.danger,
                    "warning": parsed_schema.risk_counts.warning,
                    "safe": parsed_schema.risk_counts.safe,
                },
                category_scores=category_scores_map,
                key_takeaways=parsed_schema.key_takeaways,
                clauses=domain_clauses,
                analysis_engine="gemini"
            )

        except APIError as e:
            status_code = getattr(e, "code", 500)
            message = str(e)
            logger.error(f"Gemini API SDK Error [{status_code}]: {message}")

            if status_code in (429, 500, 502, 503, 504):
                raise TransientGeminiError(f"Transient Gemini API error [{status_code}]: {message}")
            elif status_code in (400, 401, 403):
                raise GeminiAPIError(f"Invalid API key or client request [{status_code}].", auth_failed=True)
            else:
                raise GeminiAPIError(f"Gemini API error [{status_code}]: {message}")

        except json.JSONDecodeError as e:
            logger.error(f"Failed to decode Gemini JSON response: {e}")
            raise ResponseParseError(f"Malformed JSON from AI: {e}")

        except Exception as e:
            if isinstance(e, (GeminiAPIError, ResponseParseError, TransientGeminiError)):
                raise
            logger.error(f"Unexpected error during Gemini execution: {e}", exc_info=True)
            raise GeminiAPIError(f"Gemini analyzer execution error: {e}")
