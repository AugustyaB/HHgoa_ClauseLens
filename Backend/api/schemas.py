from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from models.clause import AnalysisResult

class AnalyzeRequest(BaseModel):
    """Request payload for contract analysis."""
    contract_text: str = Field(
        description="Raw text of the contract to be audited."
    )
    api_key: Optional[str] = Field(
        default=None,
        description="Optional user-provided Google Gemini API key."
    )
    contract_type: Optional[str] = Field(
        default=None,
        description="Optional contract type hint e.g. 'Lease', 'Freelance'."
    )

class HealthResponse(BaseModel):
    """Health status response."""
    status: str = "healthy"
    gemini_configured: bool
    version: str = "1.0.0"

class SampleListResponse(BaseModel):
    """Response containing list of available sample contracts."""
    samples: List[Dict[str, Any]]

class ErrorResponse(BaseModel):
    """Standardized error response payload for all HTTP errors."""
    error: bool = True
    error_code: str
    message: str
    details: Optional[Dict[str, Any]] = None
