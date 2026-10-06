from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class RiskType(str, Enum):
    """Classification of contract clause risk levels."""
    DANGER = "danger"     # Predatory, one-sided, potentially unenforceable
    WARNING = "warning"   # Ambiguous, vague, open to interpretation
    SAFE = "safe"         # Fair, balanced, standard protective clause

class Clause(BaseModel):
    """Domain model representing a single flagged contract clause."""
    id: str = Field(
        description="Unique identifier, e.g. 'clause-1'. Generated server-side."
    )
    text: str = Field(
        description="EXACT verbatim substring from original contract text used for highlighting."
    )
    type: RiskType = Field(
        description="Risk classification: danger, warning, or safe."
    )
    category: str = Field(
        description="Risk category e.g. 'Liability & Indemnification', 'Intellectual Property'."
    )
    title: str = Field(
        description="Short human-readable title e.g. 'Unlimited Personal Liability'."
    )
    explanation: str = Field(
        description="Plain-language explanation of why this clause is risky or fair."
    )
    counterclause: str = Field(
        description="Suggested fair alternative clause text to copy/replace."
    )
    start_offset: int = Field(
        default=-1,
        description="Character start position in original text. -1 if unmapped."
    )
    end_offset: int = Field(
        default=-1,
        description="Character end position in original text. -1 if unmapped."
    )

class AnalysisResult(BaseModel):
    """Complete analysis payload for a contract audit."""
    overall_score: int = Field(
        ge=0, le=100,
        description="Fairness score from 0 (predatory) to 100 (fully fair)."
    )
    summary: str = Field(
        description="2-3 sentence executive summary of contract risk profile."
    )
    risk_counts: Dict[str, int] = Field(
        description='Counts by risk type: {"danger": N, "warning": N, "safe": N}'
    )
    category_scores: Dict[str, int] = Field(
        description="Per-category fairness scores out of 100."
    )
    key_takeaways: List[str] = Field(
        description="Bullet points summarizing main red flags and positives."
    )
    clauses: List[Clause] = Field(
        description="List of flagged clauses with explanations and counterclauses."
    )
    analysis_engine: str = Field(
        default="heuristic",
        description="Which engine generated results: 'gemini', 'heuristic', or 'minimal'."
    )
    analysis_duration_ms: Optional[int] = Field(
        default=None,
        description="Analysis execution duration in milliseconds."
    )
