import time
import logging
from typing import Optional

from config import settings
from api.schemas import AnalyzeRequest
from models.clause import AnalysisResult, Clause, RiskType
from models.exceptions import (
    EmptyContractError,
    ContractTooShortError,
    ContractTooLongError,
    GeminiAPIError,
    ResponseParseError,
)
from analyzers.heuristic_analyzer import HeuristicAnalyzer
from analyzers.gemini_analyzer import GeminiAnalyzer
from services.offset_service import OffsetService

logger = logging.getLogger("clauselens.analysis_service")

class AnalysisService:
    """
    Central Orchestrator for ClauseLens Contract Audit Pipeline.
    
    1. Validates input text character length constraints.
    2. Attempts Gemini AI analysis if API key is provided or configured.
    3. Seamlessly falls back to rule-based HeuristicAnalyzer on AI failure/timeout.
    4. Enriches flagged clauses with character start/end offsets via OffsetService.
    5. Measures duration and tags transparency metadata (analysis_engine).
    """

    def __init__(self):
        self.heuristic_analyzer = HeuristicAnalyzer()

    async def analyze_contract(self, request: AnalyzeRequest) -> AnalysisResult:
        """
        Execute full contract analysis pipeline.
        
        Guarantees structured AnalysisResult is always returned, falling back
        gracefully if upstream services fail.
        """
        start_time = time.monotonic()
        text = request.contract_text.strip() if request.contract_text else ""

        # 1. Validate character length constraints
        self._validate_input(text)

        result: Optional[AnalysisResult] = None
        engine = "heuristic"
        api_key = request.api_key or settings.gemini_api_key

        # 2. Attempt Gemini AI analysis if key is available
        if api_key:
            try:
                gemini_analyzer = GeminiAnalyzer(api_key=api_key)
                result = await gemini_analyzer.analyze(
                    contract_text=text,
                    contract_type=request.contract_type
                )
                engine = "gemini"
                logger.info("Successfully audited contract using Google Gemini AI.")
            except (GeminiAPIError, ResponseParseError) as e:
                logger.warning(
                    f"Gemini API analysis failed: '{e}'. Falling back to HeuristicAnalyzer."
                )
                result = None
            except Exception as e:
                logger.error(
                    f"Unexpected exception during Gemini analysis: {e}. Falling back to HeuristicAnalyzer.",
                    exc_info=True
                )
                result = None

        # 3. Fallback to HeuristicAnalyzer if AI result is None
        if result is None:
            try:
                result = await self.heuristic_analyzer.analyze(
                    contract_text=text,
                    contract_type=request.contract_type
                )
                engine = "heuristic"
                logger.info("Successfully audited contract using HeuristicAnalyzer engine.")
            except Exception as e:
                logger.error(f"HeuristicAnalyzer failed unexpectedly: {e}. Using minimal safety result.", exc_info=True)
                result = self._minimal_fallback_result(text)
                engine = "minimal"

        # 4. Enrich flagged clauses with exact character start/end offsets
        result.clauses = OffsetService.enrich_offsets(text, result.clauses)

        # 5. Tag metadata & timing
        duration_ms = int((time.monotonic() - start_time) * 1000)
        result.analysis_engine = engine
        result.analysis_duration_ms = duration_ms

        return result

    def _validate_input(self, text: str) -> None:
        """Validate contract text character length constraints."""
        if not text:
            raise EmptyContractError("Contract text cannot be empty or whitespace-only.")
        
        if len(text) < settings.min_contract_chars:
            raise ContractTooShortError(settings.min_contract_chars)
            
        if len(text) > settings.max_contract_chars:
            raise ContractTooLongError(settings.max_contract_chars)

    def _minimal_fallback_result(self, contract_text: str) -> AnalysisResult:
        """Emergency safe-state result if all analyzers fail."""
        return AnalysisResult(
            overall_score=50,
            summary="Automated analysis encountered an error. Please review the contract text manually.",
            risk_counts={"danger": 0, "warning": 0, "safe": 0},
            category_scores={},
            key_takeaways=["Automated audit unavailable."],
            clauses=[],
            analysis_engine="minimal"
        )

# Global singleton analysis service instance
analysis_service = AnalysisService()
