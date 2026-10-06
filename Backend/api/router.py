from fastapi import APIRouter
from config import settings
from data.sample_contracts import list_samples, get_sample_by_id
from api.schemas import HealthResponse, SampleListResponse, AnalyzeRequest
from models.clause import AnalysisResult
from services.analyzer import analysis_service

api_router = APIRouter(prefix="/api")

@api_router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint. Reports status and whether Gemini API key is configured."""
    return HealthResponse(
        status="healthy",
        gemini_configured=bool(settings.gemini_api_key),
        version="1.0.0"
    )

@api_router.get("/samples", response_model=SampleListResponse)
async def get_sample_contracts():
    """Retrieve all pre-computed curated sample contracts."""
    return SampleListResponse(samples=list_samples())

@api_router.get("/samples/{sample_id}")
async def get_sample_contract_by_id(sample_id: str):
    """Retrieve a single curated sample contract by ID."""
    return get_sample_by_id(sample_id)

@api_router.post("/analyze", response_model=AnalysisResult)
async def analyze_contract(request: AnalyzeRequest):
    """
    Analyze contract text and return structured risk audit.
    
    Attempts Google Gemini AI analysis if API key is provided/configured,
    falling back automatically to the rule-based heuristic analyzer if Gemini
    is unreachable or times out.
    Enriches all flagged clauses with character start and end offsets.
    """
    return await analysis_service.analyze_contract(request)
