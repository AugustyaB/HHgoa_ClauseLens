from typing import Optional

class ClauseLensError(Exception):
    """Base exception for all ClauseLens domain errors."""
    def __init__(self, message: str, error_code: str = "INTERNAL_ERROR"):
        super().__init__(message)
        self.message = message
        self.error_code = error_code

class InputError(ClauseLensError):
    """Raised when client input fails validation."""
    pass

class EmptyContractError(InputError):
    """Raised when contract text is empty or whitespace-only."""
    def __init__(self, message: str = "Contract text cannot be empty."):
        super().__init__(message, error_code="EMPTY_CONTRACT")

class ContractTooShortError(InputError):
    """Raised when contract text is under the minimum length limit."""
    def __init__(self, min_chars: int):
        super().__init__(
            f"Contract text must be at least {min_chars} characters long.",
            error_code="CONTRACT_TOO_SHORT"
        )

class ContractTooLongError(InputError):
    """Raised when contract text exceeds the maximum character limit."""
    def __init__(self, max_chars: int):
        super().__init__(
            f"Contract text exceeds maximum limit of {max_chars} characters.",
            error_code="CONTRACT_TOO_LONG"
        )

class AnalysisError(ClauseLensError):
    """Raised when contract analysis fails."""
    pass

class GeminiAPIError(AnalysisError):
    """Raised when Gemini API request fails or is rejected."""
    def __init__(
        self,
        message: str,
        error_code: str = "GEMINI_ERROR",
        rate_limited: bool = False,
        auth_failed: bool = False,
        timeout: bool = False,
        safety_blocked: bool = False
    ):
        super().__init__(message, error_code=error_code)
        self.rate_limited = rate_limited
        self.auth_failed = auth_failed
        self.timeout = timeout
        self.safety_blocked = safety_blocked

class ResponseParseError(AnalysisError):
    """Raised when LLM returns invalid or unparseable JSON output."""
    def __init__(self, message: str = "Failed to parse structured AI output."):
        super().__init__(message, error_code="PARSE_ERROR")

class SampleNotFoundError(ClauseLensError):
    """Raised when requested sample contract ID does not exist."""
    def __init__(self, sample_id: str):
        super().__init__(
            f"Sample contract '{sample_id}' not found.",
            error_code="SAMPLE_NOT_FOUND"
        )
