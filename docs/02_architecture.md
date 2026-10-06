# 🏗️ ClauseLens — Architecture Document

> **Document Purpose**: Define the complete system design — every module, model, API contract, component, and data flow — so that implementation is a matter of filling in the blanks, not making design decisions on the fly.
>
> **Prerequisites**: Read [01 — Research & Analysis](file:///C:/Users/augus/.gemini/antigravity-ide/brain/675a5651-1143-4e08-b635-49fbde3f9d28/01_research_and_analysis.md) first. Every decision here references a takeaway from that document.
>
> **Last Updated**: 2026-10-05

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Backend Architecture](#2-backend-architecture)
3. [Domain Models (Pydantic)](#3-domain-models-pydantic)
4. [Exception Hierarchy](#4-exception-hierarchy)
5. [API Contract](#5-api-contract)
6. [Gemini Analyzer Design](#6-gemini-analyzer-design)
7. [Heuristic Analyzer Design](#7-heuristic-analyzer-design)
8. [Offset Service Design](#8-offset-service-design)
9. [Analysis Service Orchestration](#9-analysis-service-orchestration)
10. [Frontend Architecture](#10-frontend-architecture)
11. [State Management](#11-state-management)
12. [Styling & Visual System](#12-styling--visual-system)
13. [Complete Data Flow Lifecycle](#13-complete-data-flow-lifecycle)

---

## 1. System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        BROWSER (React + TypeScript)              │
│                                                                  │
│  ┌─────────────────────┐          ┌────────────────────────────┐ │
│  │    LEFT PANEL        │          │      RIGHT PANEL           │ │
│  │                      │  ◄─────► │                            │ │
│  │  ContractViewer      │ bidir.   │  Dashboard                 │ │
│  │  ├─ ContractToolbar  │  sync    │  ├─ FairnessGauge          │ │
│  │  ├─ HighlightedText  │          │  ├─ RiskSummary            │ │
│  │  └─ ContractEditor   │          │  ├─ CategoryBreakdown      │ │
│  │                      │          │  ├─ ClauseFilterBar        │ │
│  └─────────────────────┘          │  └─ ClauseCard[]           │ │
│                                    └────────────────────────────┘ │
│                        │                                         │
│                  AnalysisContext (React Context)                  │
│                        │                                         │
│                  services/api.ts  (HTTP client)                   │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                    HTTP / JSON
                    (Vite proxy)
                         │
┌────────────────────────┼─────────────────────────────────────────┐
│                   BACKEND (FastAPI + Python)                      │
│                        │                                         │
│  ┌─────────────────────┼───────────────────────────────────┐     │
│  │              api/ (Router Layer)                         │     │
│  │   router.py    schemas.py    error_handlers.py           │     │
│  └─────────────────────┼───────────────────────────────────┘     │
│                        │                                         │
│  ┌─────────────────────┼───────────────────────────────────┐     │
│  │          services/ (Business Logic Layer)                │     │
│  │   analysis_service.py        offset_service.py           │     │
│  └──────────┬──────────┼──────────────┬────────────────────┘     │
│             │          │              │                           │
│  ┌──────────▼───┐  ┌───▼──────────┐  │                           │
│  │   Gemini     │  │  Heuristic   │  │                           │
│  │   Analyzer   │  │  Analyzer    │  │                           │
│  │  (primary)   │  │  (fallback)  │  │                           │
│  └──────────────┘  └──────────────┘  │                           │
│                                      │                           │
│  ┌───────────────────────────────────▼─────────────────────┐     │
│  │              models/ (Domain Layer)                      │     │
│  │   clause.py   exceptions.py                              │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │              data/ (Static Data)                         │     │
│  │   sample_contracts.py                                    │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
│  config.py    main.py                                            │
└──────────────────────────────────────────────────────────────────┘
```

### 1.1 Design Principles (from Research Takeaways)

| Principle | Reference | Implementation |
|:--|:--|:--|
| Layered architecture | T5 | Routes → Services → Analyzers (no layer skipping) |
| Schema enforcement | T2 | All LLM outputs validated via Pydantic before reaching frontend |
| Grounded extraction | T1 | Every clause carries exact verbatim text + character offsets |
| Graceful degradation | T3 | Gemini fails → heuristic fallback. Heuristic fails → partial result. Never crash. |
| Transparency | T10 | Response includes `analysis_engine` field ("gemini" or "heuristic") |
| Consistent errors | T6 | Global exception handlers; every error follows same JSON schema |

---

## 2. Backend Architecture

### 2.1 Directory Structure

```
Backend/
├── main.py                     # App factory, lifespan events, CORS, mount error handlers
├── config.py                   # pydantic-settings based configuration
├── requirements.txt            # Pinned dependencies
├── .env.example                # Template: GEMINI_API_KEY=, LOG_LEVEL=INFO
│
├── api/
│   ├── __init__.py
│   ├── router.py               # Route definitions (thin — validate, delegate, respond)
│   ├── schemas.py              # Request/Response Pydantic models (HTTP-specific)
│   └── error_handlers.py       # @app.exception_handler registrations
│
├── services/
│   ├── __init__.py
│   ├── analysis_service.py     # Orchestrator: analyzer selection, fallback, timing
│   └── offset_service.py       # Character offset calculator + overlap resolver
│
├── analyzers/
│   ├── __init__.py
│   ├── base.py                 # Abstract BaseAnalyzer interface
│   ├── gemini_analyzer.py      # Google Gemini API client with retry + schema
│   ├── heuristic_analyzer.py   # Regex pattern engine + sample matching
│   └── prompts.py              # System prompt + prompt template constants
│
├── models/
│   ├── __init__.py
│   ├── clause.py               # Domain models: Clause, AnalysisResult, RiskType
│   └── exceptions.py           # Custom exception hierarchy (no HTTP knowledge)
│
└── data/
    ├── __init__.py
    └── sample_contracts.py     # 3 curated samples with pre-computed analyses
```

### 2.2 Module Dependency Rules

```
api/         → imports from: services/, models/, config
services/    → imports from: analyzers/, models/, data/, config
analyzers/   → imports from: models/, config
models/      → imports from: (nothing — leaf layer)
data/        → imports from: models/
config       → imports from: (nothing — leaf layer)
```

> [!IMPORTANT]
> **api/** never imports from **analyzers/** directly. **services/** never imports from **api/**. **models/** never imports from anything else. This enforces clean layer separation.

---

## 3. Domain Models (Pydantic)

### 3.1 `models/clause.py`

```python
from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional

class RiskType(str, Enum):
    """Classification of a contract clause's risk level."""
    DANGER = "danger"     # Predatory, one-sided, potentially unenforceable
    WARNING = "warning"   # Ambiguous, vague, open to interpretation
    SAFE = "safe"         # Fair, balanced, standard

class Clause(BaseModel):
    """A single flagged clause from the contract analysis."""
    id: str = Field(
        description="Unique identifier, e.g. 'clause-1'. Generated server-side."
    )
    text: str = Field(
        description="EXACT verbatim substring from the original contract text. "
                    "Used for offset matching and highlighting."
    )
    type: RiskType = Field(
        description="Risk classification: danger, warning, or safe."
    )
    category: str = Field(
        description="Risk category, e.g. 'Liability & Indemnification', "
                    "'Intellectual Property', 'Payment Terms'."
    )
    title: str = Field(
        description="Short human-readable title, e.g. 'Unlimited Personal Liability'."
    )
    explanation: str = Field(
        description="Plain-language explanation of why this clause is risky or fair. "
                    "Written for non-lawyers."
    )
    counterclause: str = Field(
        description="Suggested fair alternative clause text that protects the reader "
                    "while remaining professional and negotiable."
    )
    start_offset: int = Field(
        default=-1,
        description="Character start position in original contract text. "
                    "-1 if offset could not be determined."
    )
    end_offset: int = Field(
        default=-1,
        description="Character end position in original contract text. "
                    "-1 if offset could not be determined."
    )

class AnalysisResult(BaseModel):
    """Complete analysis output for a contract."""
    overall_score: int = Field(
        ge=0, le=100,
        description="Fairness score from 0 (predatory) to 100 (fully fair)."
    )
    summary: str = Field(
        description="2-3 sentence executive summary of the contract's risk profile."
    )
    risk_counts: dict[str, int] = Field(
        description='Counts by type: {"danger": N, "warning": N, "safe": N}'
    )
    category_scores: dict[str, int] = Field(
        description="Per-category fairness scores out of 100."
    )
    key_takeaways: list[str] = Field(
        description="Bullet-point highlights of top risks and positives."
    )
    clauses: list[Clause] = Field(
        description="All flagged clauses with explanations and counterclauses."
    )
    analysis_engine: str = Field(
        default="heuristic",
        description="Which engine produced results: 'gemini' or 'heuristic'. "
                    "Shown to user for transparency."
    )
    analysis_duration_ms: Optional[int] = Field(
        default=None,
        description="Time taken for analysis in milliseconds."
    )
```

### 3.2 Why These Fields

| Field | Rationale |
|:--|:--|
| `text` (exact verbatim) | Takeaway T1 — grounded extraction. Must match original for highlighting. |
| `start_offset` / `end_offset` | Takeaway T8 — server-side offset computation for reliable highlighting. |
| `counterclause` | Gap analysis — our key differentiator. No competitor does this well. |
| `analysis_engine` | Takeaway T10 — transparency about which engine produced results. |
| `analysis_duration_ms` | Observability — helps detect slow API calls and tune timeouts. |
| `overall_score` with `ge=0, le=100` | Pydantic validation prevents impossible scores from LLM hallucination. |

---

## 4. Exception Hierarchy

### 4.1 `models/exceptions.py`

```
ClauseLensError (base)
│
├── InputError
│   ├── EmptyContractError        — Contract text is empty or whitespace-only
│   └── ContractTooLongError      — Exceeds maximum character limit
│
├── AnalysisError                 — General analysis failure
│   ├── GeminiAPIError            — Gemini-specific failures
│   │   ├── .rate_limited         — 429 Resource Exhausted
│   │   ├── .auth_failed          — 403/401 Invalid API key
│   │   ├── .server_error         — 5xx Server Error
│   │   ├── .timeout              — Request exceeded timeout
│   │   └── .safety_blocked       — Content blocked by safety filters
│   └── ResponseParseError        — LLM returned malformed/invalid JSON
│
└── SampleNotFoundError           — Requested sample contract ID doesn't exist
```

### 4.2 Exception → HTTP Status Mapping

This mapping lives in `api/error_handlers.py` and is the ONLY place HTTP status codes appear outside of routes:

| Exception | HTTP Status | Error Code | User Message |
|:--|:--|:--|:--|
| `EmptyContractError` | 400 | `EMPTY_CONTRACT` | "Contract text cannot be empty." |
| `ContractTooLongError` | 413 | `CONTRACT_TOO_LONG` | "Contract exceeds {limit} character limit." |
| `GeminiAPIError` (rate_limited) | 429 | `GEMINI_RATE_LIMIT` | "AI service is temporarily busy. Try again shortly." |
| `GeminiAPIError` (auth_failed) | 401 | `INVALID_API_KEY` | "Invalid Gemini API key." |
| `GeminiAPIError` (server/timeout) | 503 | `GEMINI_UNAVAILABLE` | "AI service unavailable. Results from built-in engine." |
| `GeminiAPIError` (safety_blocked) | 503 | `CONTENT_FILTERED` | "AI content filters triggered. Using built-in engine." |
| `ResponseParseError` | 502 | `PARSE_ERROR` | "AI response was malformed. Using built-in engine." |
| `SampleNotFoundError` | 404 | `SAMPLE_NOT_FOUND` | "Sample contract not found." |
| `Exception` (catch-all) | 500 | `INTERNAL_ERROR` | "An unexpected error occurred." |

> [!IMPORTANT]
> Note that `GeminiAPIError` reaching the API layer should be rare. The analysis service is designed to catch these and fall back to the heuristic analyzer. They only reach the API layer if the heuristic also fails (which should never happen, but we handle it anyway).

---

## 5. API Contract

### 5.1 `GET /api/health`

**Purpose**: Health check. Reports whether backend is running and whether Gemini is configured.

**Response** `200 OK`:
```json
{
  "status": "healthy",
  "gemini_configured": true,
  "version": "1.0.0"
}
```

No error states — this endpoint always succeeds if the server is running.

---

### 5.2 `GET /api/samples`

**Purpose**: Returns all curated sample contracts with their pre-computed analyses.

**Response** `200 OK`:
```json
{
  "samples": [
    {
      "id": "freelance_dev",
      "title": "Freelance Software Development Agreement",
      "category": "Freelance & Consulting",
      "description": "Standard freelance contract with hidden high-risk clauses...",
      "text": "FREELANCE SOFTWARE DEVELOPMENT AGREEMENT\n\nThis Agreement...",
      "sample_analysis": { /* full AnalysisResult */ }
    }
  ]
}
```

No error states — sample data is static and always available.

---

### 5.3 `POST /api/analyze`

**Purpose**: Analyze contract text and return structured audit results.

**Request Body**:
```json
{
  "contract_text": "string (required, min 50 chars)",
  "api_key": "string | null (optional, Gemini API key)",
  "contract_type": "string | null (optional, e.g. 'Lease', 'Freelance')"
}
```

**Success Response** `200 OK`:
```json
{
  "overall_score": 38,
  "summary": "This contract is heavily one-sided...",
  "risk_counts": { "danger": 5, "warning": 2, "safe": 1 },
  "category_scores": { "Liability & Risk": 20, "IP Rights": 35 },
  "key_takeaways": ["HIGH RISK: Unlimited liability..."],
  "clauses": [
    {
      "id": "clause-1",
      "text": "Developer warrants that all deliverables shall be free from any bugs...",
      "type": "warning",
      "category": "Warranty & Maintenance",
      "title": "Unreasonable 5-Year Bug Warranty",
      "explanation": "A 5-year defect-free warranty is unrealistic...",
      "counterclause": "Developer warrants that deliverables will substantially conform...",
      "start_offset": 245,
      "end_offset": 398
    }
  ],
  "analysis_engine": "gemini",
  "analysis_duration_ms": 4230
}
```

**Error Response** (all errors follow same schema):
```json
{
  "error": true,
  "error_code": "GEMINI_RATE_LIMIT",
  "message": "AI service is temporarily busy. Please try again in a moment.",
  "details": null
}
```

---

## 6. Gemini Analyzer Design

### 6.1 Responsibilities

- Build the analysis prompt from contract text + system prompt
- Call Gemini API with `response_schema` enforcement
- Handle all API errors with appropriate retries
- Return a raw `AnalysisResult` (without offsets — those come from OffsetService)

### 6.2 Retry Strategy

```python
# Using tenacity library
@retry(
    wait=wait_exponential_jitter(initial=1, max=30),   # 1s → 2s → 4s... up to 30s
    stop=stop_after_attempt(3),                         # Max 3 attempts
    retry=retry_if_exception_type((RateLimitError, ServerError)),
    before_sleep=log_retry_attempt                      # Log each retry
)
async def _call_gemini(self, prompt: str) -> AnalysisResult:
    ...
```

### 6.3 Error Detection Flow

```
Call Gemini API
│
├─ HTTP 429 → raise RateLimitError → tenacity retries (up to 3x)
├─ HTTP 5xx → raise ServerError → tenacity retries (up to 3x)
├─ HTTP 400 → raise GeminiAPIError(auth_failed) → NO retry
├─ HTTP 403 → raise GeminiAPIError(auth_failed) → NO retry
├─ Timeout  → raise GeminiAPIError(timeout) → NO retry
│
├─ Response received:
│   ├─ finish_reason == SAFETY → raise GeminiAPIError(safety_blocked)
│   ├─ response.text is empty → raise ResponseParseError
│   ├─ json.loads fails → raise ResponseParseError
│   ├─ Pydantic validation fails → raise ResponseParseError
│   └─ All checks pass → return AnalysisResult ✓
│
└─ tenacity exhausted → raise GeminiAPIError (last error)
```

### 6.4 System Prompt Design

Lives in `analyzers/prompts.py`. Key elements:

1. **Persona**: "You are ClauseLens AI, a senior legal counsel specializing in consumer contract review."
2. **Task**: "Analyze the contract and identify dangerous, ambiguous, and fair clauses."
3. **Critical constraint**: "The `text` field MUST be an EXACT VERBATIM substring copied from the input. Do not paraphrase."
4. **Chain of thought**: "First identify clauses, then classify, then explain, then draft counterclauses, then score."
5. **Scoring instruction**: "Score from 0 (predatory) to 100 (fair). Consider liability, IP, payment, termination, restrictive covenants, privacy."
6. **Category list**: Provide the 6 risk categories so the AI uses consistent labels.

---

## 7. Heuristic Analyzer Design

### 7.1 Two-Stage Analysis

**Stage 1 — Sample Matching**: Check if input matches a curated sample contract (fuzzy match on first ~30 words). If yes, return the pre-computed expert analysis immediately.

**Stage 2 — Pattern Scanning**: If no sample match, scan contract text against a library of regex patterns organized by risk category.

### 7.2 Pattern Library Structure

```python
RISK_PATTERNS = [
    {
        "category": "Liability & Indemnification",
        "patterns": [
            r"indemnify|hold harmless",
            r"unlimited liability",
            r"regardless of fault",
            r"defend, indemnify",
        ],
        "default_type": "danger",
        "default_title": "Broad Indemnification / Liability",
        "default_explanation": "This clause shifts financial liability onto you...",
        "default_counterclause": "Neither party shall be liable for indirect..."
    },
    # ... more categories
]
```

### 7.3 Scoring Algorithm

```python
def calculate_score(clauses: list[Clause]) -> int:
    WEIGHTS = {
        "Liability & Indemnification": 0.25,
        "Intellectual Property & Data": 0.20,
        "Payment & Financial Terms": 0.20,
        "Termination & Exit": 0.15,
        "Restrictive Covenants": 0.10,
        "Privacy, Access & Compliance": 0.10,
    }
    PENALTIES = {"danger": 15, "warning": 7, "safe": 0}

    total_penalty = 0
    for clause in clauses:
        weight = WEIGHTS.get(clause.category, 0.15)  # default weight if unknown category
        penalty = PENALTIES[clause.type]
        total_penalty += penalty * weight

    return max(0, min(100, round(100 - total_penalty)))
```

---

## 8. Offset Service Design

### 8.1 Purpose

Maps each clause's `text` field to exact `(start_offset, end_offset)` character positions in the original contract text. This enables precise highlighting on the frontend.

### 8.2 Multi-Level Matching Algorithm

```
For each clause.text:
│
├─ Level 1: EXACT MATCH
│   contract_text.find(clause.text)
│   → If found: return (start, start + len)
│
├─ Level 2: NORMALIZED WHITESPACE
│   Collapse all whitespace to single spaces in both texts
│   normalized_text.find(normalized_snippet)
│   → If found: map back to original positions
│
├─ Level 3: FUZZY HEAD MATCH
│   Match first 40 characters of snippet
│   → If found: return approximate (start, start + original_len)
│
└─ Level 4: FAILURE
    → Set offsets to (-1, -1)
    → Clause card still appears in dashboard, but no in-text highlight
```

### 8.3 Overlap Resolution

After all clauses are matched:

```
1. Sort clauses by start_offset ascending
2. Walk through sorted list:
   - If clause[i].start_offset < previous_clause.end_offset:
     → Overlap detected
     → Keep the first clause, set overlapping clause offsets to (-1, -1)
3. Return de-overlapped list
```

### 8.4 Why Server-Side Offsets?

Computing offsets on the backend (not the frontend) means:
- The frontend doesn't need string-matching logic
- Offsets are computed once, not on every re-render
- The backend can use more sophisticated matching (fuzzy, normalized) without shipping that logic to the browser

---

## 9. Analysis Service Orchestration

### 9.1 The Core Orchestration Flow

```python
async def analyze(self, contract_text: str, api_key: str | None, 
                  contract_type: str | None) -> AnalysisResult:
    """
    THE CENTRAL GUARANTEE:
    This method ALWAYS returns an AnalysisResult.
    It NEVER raises an exception to the caller.
    If everything fails, it returns a minimal valid result.
    """
    start_time = time.monotonic()
    result = None
    engine = "heuristic"

    # Step 1: Validate input (this CAN raise — InputError is the caller's problem)
    self._validate_input(contract_text)

    # Step 2: Try Gemini if API key available
    if api_key:
        try:
            result = await self.gemini_analyzer.analyze(contract_text, contract_type)
            engine = "gemini"
        except (GeminiAPIError, ResponseParseError) as e:
            logger.warning(f"Gemini analysis failed: {e}. Falling back to heuristic.")
            result = None  # Explicit — fall through to heuristic

    # Step 3: Heuristic fallback (always available)
    if result is None:
        try:
            result = self.heuristic_analyzer.analyze(contract_text, contract_type)
            engine = "heuristic"
        except Exception as e:
            # This should NEVER happen, but if it does:
            logger.error(f"Heuristic analyzer failed: {e}. Returning minimal result.")
            result = self._minimal_result(contract_text)
            engine = "heuristic"

    # Step 4: Enrich with character offsets
    result.clauses = self.offset_service.enrich_offsets(contract_text, result.clauses)

    # Step 5: Tag metadata
    result.analysis_engine = engine
    result.analysis_duration_ms = int((time.monotonic() - start_time) * 1000)

    return result
```

### 9.2 The Minimal Result Safety Net

If both Gemini AND heuristic fail (should be impossible, but we handle it):

```python
def _minimal_result(self, contract_text: str) -> AnalysisResult:
    return AnalysisResult(
        overall_score=50,
        summary="Automated analysis encountered an error. Please review manually.",
        risk_counts={"danger": 0, "warning": 0, "safe": 0},
        category_scores={},
        key_takeaways=["Analysis could not be completed automatically."],
        clauses=[],
        analysis_engine="minimal"
    )
```

---

## 10. Frontend Architecture

### 10.1 Directory Structure

```
Frontend/src/
├── main.tsx                    # React DOM mount point
├── App.tsx                     # Root layout: Navbar + TwoPanel
├── index.css                   # Tailwind + custom highlight classes
│
├── types/
│   └── index.ts                # TS interfaces mirroring backend models
│
├── services/
│   └── api.ts                  # HTTP client with timeout + error handling
│
├── context/
│   └── AnalysisContext.tsx      # React Context provider + useReducer
│
├── hooks/
│   ├── useAnalysis.ts           # Triggers analysis, manages async state
│   └── useSamples.ts            # Fetches samples on mount
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx            # Brand, sample buttons, action buttons
│   │   └── TwoPanel.tsx          # Responsive split-panel container
│   │
│   ├── contract/                 # LEFT PANEL feature module
│   │   ├── ContractViewer.tsx    # Orchestrator (mode switching, toolbar, content)
│   │   ├── ContractToolbar.tsx   # Mode toggle, import, copy, word count
│   │   ├── HighlightedText.tsx   # Offset-based <mark> rendering engine
│   │   └── ContractEditor.tsx    # Raw textarea for editing
│   │
│   ├── dashboard/                # RIGHT PANEL feature module
│   │   ├── Dashboard.tsx         # Orchestrator (stacks all dashboard components)
│   │   ├── FairnessGauge.tsx     # SVG radial score meter
│   │   ├── RiskSummary.tsx       # Executive summary + key takeaways
│   │   ├── CategoryBreakdown.tsx # Per-category progress bars
│   │   ├── ClauseFilterBar.tsx   # Filter pills + search input
│   │   └── ClauseCard.tsx        # Individual expandable clause card
│   │
│   └── shared/                   # Reusable UI components
│       ├── ApiKeyModal.tsx       # Gemini API key configuration
│       ├── ErrorBanner.tsx       # Dismissible error notification
│       ├── LoadingOverlay.tsx    # Skeleton loading state
│       └── CopyButton.tsx        # Clipboard copy with confirmation
│
└── utils/
    └── export.ts                 # Markdown report generation + download
```

### 10.2 Component Hierarchy & Responsibilities

```
App
├── Navbar
│   ├── Brand/Logo
│   ├── SampleButtons[]            — Load pre-built sample contracts
│   ├── AuditButton                — Trigger analysis
│   ├── ApiKeyButton               — Open API key modal
│   ├── ExportButton               — Download markdown report
│   └── ClearButton                — Reset all state
│
├── TwoPanel
│   ├── ContractViewer             — LEFT PANEL orchestrator
│   │   ├── ContractToolbar        — Mode toggle (reader/editor), import, copy
│   │   ├── HighlightedText        — Reader mode: colored <mark> elements
│   │   │   └── <mark> elements    — Each is clickable → sets activeClauseId
│   │   └── ContractEditor         — Editor mode: <textarea>
│   │
│   └── Dashboard                  — RIGHT PANEL orchestrator
│       ├── FairnessGauge          — SVG radial score + status badge
│       ├── RiskSummary            — Summary text + key takeaway bullets
│       ├── CategoryBreakdown      — Progress bars per risk category
│       ├── ClauseFilterBar        — Filter (all/danger/warning/safe) + search
│       └── ClauseCard[]           — Expandable cards, each contains:
│           ├── Header             — Icon, category tag, severity badge, title
│           └── Body (expandable)
│               ├── OriginalText   — Quoted contract snippet
│               ├── Explanation    — AI risk assessment
│               └── Counterclause  — Fair alternative + Copy/Replace buttons
│
├── ApiKeyModal                    — Overlay for Gemini key configuration
├── ErrorBanner                    — Sticky error notifications
└── LoadingOverlay                 — Shown during analysis
```

### 10.3 Key Component Contracts

#### `HighlightedText` Props
```typescript
interface HighlightedTextProps {
  contractText: string;
  clauses: Clause[];
  activeClauseId: string | null;
  onClauseClick: (clauseId: string) => void;
}
```
- **Renders**: Contract text with colored `<mark>` elements for each clause with valid offsets
- **Handles**: Click on any `<mark>` → calls `onClauseClick` → parent updates `activeClauseId`
- **Edge case**: If no clauses have valid offsets → renders plain text (no crash)
- **Performance**: Memoizes segment array with `useMemo`

#### `ClauseCard` Props
```typescript
interface ClauseCardProps {
  clause: Clause;
  isActive: boolean;
  onSelect: (clauseId: string) => void;
  onReplace: (originalText: string, replacement: string) => void;
}
```
- **Renders**: Expandable card with clause details
- **Handles**: Click → calls `onSelect` → scrolls corresponding highlight into view
- **Copy**: Copies counterclause to clipboard with visual "Copied!" feedback
- **Replace**: Calls `onReplace` → parent swaps text in contract → card shows "Applied ✓"

---

## 11. State Management

### 11.1 Context Shape

```typescript
interface AnalysisState {
  // ── Input ──
  contractText: string;

  // ── Analysis Results ──
  analysis: AnalysisResult | null;

  // ── UI State ──
  activeClauseId: string | null;
  viewMode: 'reader' | 'editor';

  // ── Async State ──
  isAnalyzing: boolean;
  analysisError: string | null;  // null = no error

  // ── API Key ──
  apiKey: string;  // Persisted to localStorage

  // ── Sample Data ──
  samples: SampleContract[];
  samplesLoaded: boolean;
}
```

### 11.2 Actions (useReducer)

```typescript
type AnalysisAction =
  | { type: 'SET_CONTRACT_TEXT'; text: string }
  | { type: 'SET_ANALYSIS'; result: AnalysisResult }
  | { type: 'SET_ACTIVE_CLAUSE'; clauseId: string | null }
  | { type: 'SET_VIEW_MODE'; mode: 'reader' | 'editor' }
  | { type: 'SET_ANALYZING'; isAnalyzing: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_API_KEY'; key: string }
  | { type: 'SET_SAMPLES'; samples: SampleContract[] }
  | { type: 'LOAD_SAMPLE'; sample: SampleContract }
  | { type: 'REPLACE_CLAUSE'; originalText: string; replacement: string }
  | { type: 'CLEAR_ALL' };
```

### 11.3 Why useReducer over useState

With 10+ state variables and actions like `LOAD_SAMPLE` that update 3 fields simultaneously (`contractText` + `analysis` + `activeClauseId`), individual `useState` calls lead to:
- Multiple re-renders per logical action
- Inconsistent intermediate states
- Scattered update logic

`useReducer` ensures atomic state transitions and centralizes the update logic.

---

## 12. Styling & Visual System

### 12.1 Color System

| Role | Color | Hex | Usage |
|:--|:--|:--|:--|
| Background (base) | Deep navy | `#090d16` | Page background |
| Background (panel) | Dark slate | `#0d1322` | Panel backgrounds |
| Background (card) | Slate | `#0f172a` | Card backgrounds |
| Primary accent | Indigo | `#6366f1` | Buttons, AI elements, active states |
| Danger | Rose | `#ef4444` | Dangerous clause highlights and badges |
| Warning | Amber | `#f59e0b` | Ambiguous clause highlights and badges |
| Safe | Emerald | `#10b981` | Fair clause highlights and badges |
| Text (primary) | Slate 100 | `#f1f5f9` | Main body text |
| Text (secondary) | Slate 400 | `#94a3b8` | Secondary text, labels |
| Border | Slate 800 | `#1e293b` | Panel borders, dividers |

### 12.2 Highlight Classes (in `index.css`)

```css
/* Each class defines: background, border-bottom, hover glow, active ring */
.highlight-danger        /* Red background + red underline */
.highlight-danger:hover  /* Brighter red + red box-shadow glow */
.highlight-danger.active /* Red ring-2 + elevated background */

.highlight-warning       /* Amber background + amber underline */
.highlight-warning:hover /* Brighter amber + amber box-shadow glow */
.highlight-warning.active/* Amber ring-2 + elevated background */

.highlight-safe          /* Emerald background + emerald underline */
.highlight-safe:hover    /* Brighter emerald + emerald box-shadow glow */
.highlight-safe.active   /* Emerald ring-2 + elevated background */
```

These are custom CSS classes (not Tailwind utilities) because they need combined pseudo-class states (`:hover`, `.active`) that are cleaner as standalone classes.

---

## 13. Complete Data Flow Lifecycle

### 13.1 User Clicks "Audit Contract" — Full Trace

```
USER clicks "Audit Contract" button
│
│  ┌─ FRONTEND ──────────────────────────────────────────────┐
│  │                                                          │
│  │  1. Navbar.AuditButton.onClick()                         │
│  │     → calls context.triggerAnalysis()                    │
│  │                                                          │
│  │  2. useAnalysis hook:                                    │
│  │     a. dispatch({ type: 'SET_ANALYZING', true })         │
│  │     b. dispatch({ type: 'SET_ERROR', null })             │
│  │     c. Call api.analyzeContract(contractText, apiKey)     │
│  │        └─ POST /api/analyze with AbortController (35s)   │
│  │                                                          │
│  └──────────────────────┼───────────────────────────────────┘
                          │
                    HTTP POST /api/analyze
                    { contract_text, api_key }
                          │
│  ┌─ BACKEND ────────────┼───────────────────────────────────┐
│  │                      │                                    │
│  │  3. api/router.py:                                        │
│  │     a. Pydantic validates request body (AnalyzeRequest)   │
│  │        ├─ Invalid → 422 ValidationError (automatic)       │
│  │        └─ Valid → continue                                │
│  │     b. Call analysis_service.analyze(text, key, type)     │
│  │                                                          │
│  │  4. services/analysis_service.py:                         │
│  │     a. Validate input (empty? too long?)                  │
│  │        ├─ Empty → raise EmptyContractError                │
│  │        ├─ Too long → raise ContractTooLongError           │
│  │        └─ Valid → continue                                │
│  │     b. Start timer                                        │
│  │     c. IF api_key:                                        │
│  │        TRY gemini_analyzer.analyze()                      │
│  │        │  └─ calls Gemini API with retry logic            │
│  │        │     ├─ 429 → retry 3x with backoff               │
│  │        │     ├─ 5xx → retry 3x with backoff               │
│  │        │     ├─ Success → parse JSON → validate Pydantic  │
│  │        │     │   ├─ Valid → return AnalysisResult ✓        │
│  │        │     │   └─ Invalid → raise ResponseParseError    │
│  │        │     └─ All retries exhausted → raise GeminiAPIError │
│  │        │                                                  │
│  │        CATCH → log warning, set result=None               │
│  │                                                          │
│  │     d. IF result is None:                                 │
│  │        heuristic_analyzer.analyze()                       │
│  │        ├─ Check sample match → return pre-computed ✓      │
│  │        └─ Pattern scan → build clauses → calculate score  │
│  │                                                          │
│  │     e. offset_service.enrich_offsets(text, clauses)       │
│  │        └─ For each clause: exact → normalized → fuzzy → -1│
│  │                                                          │
│  │     f. Attach engine tag + duration_ms                    │
│  │     g. Return AnalysisResult                              │
│  │                                                          │
│  │  5. api/router.py:                                        │
│  │     Return 200 + AnalysisResult JSON                      │
│  │                                                          │
│  └──────────────────────┼───────────────────────────────────┘
                          │
                    HTTP 200 + JSON body
                          │
│  ┌─ FRONTEND ───────────┼───────────────────────────────────┐
│  │                      │                                    │
│  │  6. services/api.ts:                                      │
│  │     a. Check response.ok                                  │
│  │        ├─ Not ok → parse error body → throw ApiError      │
│  │        └─ Ok → parse JSON → return AnalysisResult         │
│  │                                                          │
│  │  7. useAnalysis hook:                                     │
│  │     ON SUCCESS:                                           │
│  │     a. dispatch({ type: 'SET_ANALYSIS', result })         │
│  │     b. dispatch({ type: 'SET_VIEW_MODE', 'reader' })     │
│  │     c. dispatch({ type: 'SET_ACTIVE_CLAUSE', first.id }) │
│  │     d. dispatch({ type: 'SET_ANALYZING', false })         │
│  │                                                          │
│  │     ON ERROR:                                             │
│  │     a. dispatch({ type: 'SET_ERROR', error.message })     │
│  │     b. dispatch({ type: 'SET_ANALYZING', false })         │
│  │     c. IF error.code === 'INVALID_API_KEY':               │
│  │           → open ApiKeyModal                              │
│  │                                                          │
│  │  8. React re-renders:                                     │
│  │     LEFT:  HighlightedText renders <mark> elements        │
│  │     RIGHT: Dashboard renders gauge + cards                │
│  │                                                          │
│  └──────────────────────────────────────────────────────────┘
```

### 13.2 User Clicks a Highlighted Clause — Bidirectional Sync

```
USER clicks <mark> element on LEFT panel
│
├─ HighlightedText.onClauseClick(clauseId)
│  └─ context.setActiveClauseId(clauseId)
│
├─ HighlightedText re-renders:
│  └─ Clicked <mark> gets .active class (ring highlight)
│
├─ Dashboard re-renders:
│  └─ Matching ClauseCard gets isActive=true (border highlight)
│
└─ Scroll effect:
   └─ document.getElementById(`card-clause-${clauseId}`)
      .scrollIntoView({ behavior: 'smooth', block: 'nearest' })
```

```
USER clicks ClauseCard on RIGHT panel
│
├─ ClauseCard.onSelect(clauseId)
│  └─ context.setActiveClauseId(clauseId)
│
├─ ClauseCard re-renders:
│  └─ Clicked card gets isActive=true (border highlight)
│
├─ HighlightedText re-renders:
│  └─ Matching <mark> gets .active class (ring highlight)
│
└─ Scroll effect:
   └─ document.getElementById(`text-clause-${clauseId}`)
      .scrollIntoView({ behavior: 'smooth', block: 'center' })
```

---

> **Next Document**: [03 — Workflow Guide](file:///C:/Users/augus/.gemini/antigravity-ide/brain/675a5651-1143-4e08-b635-49fbde3f9d28/03_workflow_guide.md) — How we build this, step by step, with verification gates and adversarial testing at every phase.
