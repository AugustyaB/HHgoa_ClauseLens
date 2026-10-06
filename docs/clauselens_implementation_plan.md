# ClauseLens — Implementation Plan

> **Goal**: Build a web application where users paste everyday contracts (leases, freelance agreements, NDAs, TOS) and an AI instantly audits them for unfair, predatory, or ambiguous clauses — presenting results in a two-panel layout with highlighted text on the left and an interactive dashboard on the right.

---

## 1. Competitive Landscape & Lessons Learned

Before writing code, I researched how existing tools solve the same problem — what they do well, where they fall short, and what patterns we should adopt or avoid.

### 1.1 Tools Studied

| Tool | Target User | Approach | Strengths | Weaknesses |
|:--|:--|:--|:--|:--|
| **LegalOn** | Enterprise legal teams | Attorney-built playbooks + LLM | Consistent, "decision-grade" risk detection; Word integration; audit trails | Enterprise-only, not consumer-accessible; requires playbook setup |
| **Justee AI** | SMBs & individuals | Cloud-based AI analysis | Color-coded risk highlights; free-to-start; accessible for non-lawyers | Lacks deep customization; limited to document comparison |
| **DoNotPay** | Individual consumers | Chatbot-based automation | Broad consumer advocacy; simple UX | Shallow clause analysis; pre-defined patterns only; regulatory concerns about "robot lawyer" claims |
| **Luminance** | M&A / law firms | AI anomaly detection | Understands clause *intent*, not just keywords; contextual analysis | Enterprise pricing; overkill for consumer contracts |
| **Spellbook / CoCounsel** | Legal professionals | Microsoft Word copilot | Integrated into existing workflows; research-backed | Not standalone; requires Office ecosystem |

### 1.2 Key Takeaways for ClauseLens

From studying these tools, our design should incorporate:

1. **Plain-Language Explanations** (Justee, DoNotPay) — Non-lawyers are our primary users. Every flagged clause must have a jargon-free explanation of *why* it's risky and *what it means for them*.

2. **Exact Source Text Tracing** (LegalOn, Luminance) — Every AI insight must link back to the exact text in the contract. No vague references. This is the "grounded extraction" pattern that separates production tools from toys.

3. **Actionable Counterclauses** (LegalOn) — Don't just flag problems; provide copy-pasteable fair alternatives. This is what makes the tool *useful* rather than just informative.

4. **Human-in-the-Loop Design** — We must include clear disclaimers that this is a "first-pass screening tool, not legal advice." The AI flags; the human decides.

5. **Graceful Degradation** (DoNotPay pattern) — Work without an API key by using a built-in heuristic engine with curated sample contracts. Users should get value immediately, even before connecting Gemini.

### 1.3 What Existing Tools Lack (Our Differentiator)

- **Instant, no-signup consumer access** — Most tools require enterprise accounts or legal team onboarding. ClauseLens works immediately in-browser.
- **Interactive two-panel audit** — Click a highlighted clause on the left → card expands on the right. Click a card on the right → text scrolls into view on the left. Bidirectional sync.
- **One-click clause replacement** — Replace a predatory clause directly in the contract text with the fair alternative. Export the cleaned contract.

---

## 2. Architecture Overview

### 2.1 High-Level System Design

```
┌─────────────────────────────────────────────────────────┐
│                      BROWSER (React)                     │
│                                                          │
│  ┌──────────────────┐    ┌────────────────────────────┐  │
│  │   LEFT PANEL     │    │      RIGHT PANEL           │  │
│  │   Contract Text  │◄──►│   Fairness Dashboard       │  │
│  │   + Highlights   │    │   + Expandable Clause Cards │  │
│  └──────────────────┘    └────────────────────────────┘  │
│           │                         │                     │
│           └─────────┬───────────────┘                     │
│                     │                                     │
│              AnalysisContext                              │
│              (React Context)                              │
└─────────────────────┼───────────────────────────────────┘
                      │ HTTP (POST /api/analyze)
                      │ HTTP (GET  /api/samples)
                      │ HTTP (GET  /api/health)
┌─────────────────────┼───────────────────────────────────┐
│              BACKEND (FastAPI)                            │
│                     │                                     │
│    ┌────────────────┼──────────────────────┐              │
│    │         API Router Layer              │              │
│    │   (Routes, Request Validation,        │              │
│    │    Structured Error Responses)         │              │
│    └────────────────┼──────────────────────┘              │
│                     │                                     │
│    ┌────────────────┼──────────────────────┐              │
│    │         Service Layer                 │              │
│    │   (Business logic, orchestration)     │              │
│    └────────┬───────┼──────────┬───────────┘              │
│             │       │          │                          │
│    ┌────────▼──┐ ┌──▼───────┐ ┌▼──────────┐              │
│    │  Gemini   │ │ Heuristic│ │  Offset   │              │
│    │  Analyzer │ │ Analyzer │ │ Calculator│              │
│    │  (Primary)│ │(Fallback)│ │           │              │
│    └───────────┘ └──────────┘ └───────────┘              │
│                                                          │
│    ┌──────────────────────────────────────┐               │
│    │          Sample Data Store           │               │
│    │    (Curated contract examples)       │               │
│    └──────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Design Principles

| Principle | How We Apply It |
|:--|:--|
| **Layered Architecture** | Routes → Services → Analyzers. Routes never contain business logic. Services never know about HTTP. |
| **Schema Enforcement** | All LLM outputs validated through Pydantic models before reaching the frontend. |
| **Fail Safely** | If Gemini fails → fallback to heuristic engine. If heuristic fails → return partial results with clear "inconclusive" labels. Never crash. |
| **Grounded Extraction** | Every AI-generated clause card traces back to an exact substring + character offset in the original text. |
| **Separation of Concerns** | Frontend state managed through React Context. Components are presentational. Business logic lives in hooks and services. |

---

## 3. Risk Scoring Methodology

> [!IMPORTANT]
> The scoring system is the intellectual core of ClauseLens. It must be transparent, reproducible, and explainable to the user.

### 3.1 Clause Risk Categories

Based on research into legal risk scoring algorithms and predatory clause taxonomies, we define **6 core risk categories**:

| # | Category | Description | Weight | Example Red Flags |
|:--|:--|:--|:--|:--|
| 1 | **Liability & Indemnification** | Who bears financial risk for claims, losses, damages | **25%** | Unlimited liability, one-sided indemnity, "regardless of fault" |
| 2 | **Intellectual Property & Data** | Ownership of work product, data rights, AI training | **20%** | Perpetual IP assignment, data monetization, moral rights waiver |
| 3 | **Payment & Financial Terms** | Payment timing, withholding, refund policies, fee changes | **20%** | Sole discretion withholding, non-refundable fees, no pro-rata on termination |
| 4 | **Termination & Exit** | How either party can end the relationship | **15%** | Asymmetric notice periods, no compensation on early termination |
| 5 | **Restrictive Covenants** | Non-compete, non-solicitation, exclusivity | **10%** | Multi-year non-competes, broad geographic/industry scope |
| 6 | **Privacy, Access & Compliance** | Data handling, premises access, regulatory obligations | **10%** | Unannounced entry, waived safety obligations, no data deletion rights |

### 3.2 Clause-Level Scoring

Each individual clause receives a classification:

| Classification | Label | Score Impact | Visual |
|:--|:--|:--|:--|
| **Dangerous** | Predatory, one-sided, potentially unenforceable | High negative weight | 🔴 Red highlight |
| **Ambiguous** | Vague, open to interpretation, sneaky | Medium negative weight | 🟡 Yellow highlight |
| **Fair** | Balanced, standard, protective of both parties | Neutral/positive | 🟢 Green highlight |

### 3.3 Overall Score Formula

```
Overall Score = 100 - Σ(clause_penalty × category_weight × severity_multiplier)

Where:
  - clause_penalty: base deduction per clause (danger=15, warning=7, safe=0)
  - category_weight: from table above (0.10 to 0.25)
  - severity_multiplier: context-dependent (1.0 to 2.0, e.g., unlimited liability = 2.0x)

Score is clamped to range [0, 100].
```

### 3.4 Score Interpretation Bands

| Score Range | Status | Badge Color | Meaning |
|:--|:--|:--|:--|
| 75–100 | Fair & Protective | 🟢 Emerald | Standard terms, balanced protections |
| 50–74 | Moderate Risk | 🟡 Amber | Some concerning clauses, review recommended |
| 25–49 | High Risk | 🟠 Orange | Multiple predatory clauses, negotiate before signing |
| 0–24 | Predatory | 🔴 Red | Heavily one-sided, seek legal counsel before signing |

---

## 4. Backend Design (Python + FastAPI)

### 4.1 Project Structure

```
Backend/
├── main.py                    # FastAPI app factory, startup/shutdown, CORS
├── config.py                  # Environment configuration (pydantic-settings)
├── requirements.txt           # Pinned dependencies
├── .env.example               # Template for environment variables
│
├── api/
│   ├── __init__.py
│   ├── router.py              # API route definitions (thin layer)
│   ├── schemas.py             # Request/Response Pydantic models
│   └── error_handlers.py     # Global exception handlers
│
├── services/
│   ├── __init__.py
│   ├── analysis_service.py    # Orchestrator: decides Gemini vs heuristic, enriches results
│   └── offset_service.py     # Character offset calculator for text highlighting
│
├── analyzers/
│   ├── __init__.py
│   ├── base.py                # Abstract base analyzer interface
│   ├── gemini_analyzer.py     # Google Gemini API integration
│   ├── heuristic_analyzer.py  # Pattern-based fallback analyzer
│   └── prompts.py             # System prompts and prompt templates
│
├── models/
│   ├── __init__.py
│   ├── clause.py              # Clause, RiskType, AnalysisResult domain models
│   └── exceptions.py         # Custom exception hierarchy
│
└── data/
    ├── __init__.py
    └── sample_contracts.py    # Curated sample contracts with pre-computed analyses
```

### 4.2 Module Responsibilities

#### 4.2.1 `config.py` — Environment & Settings

**Purpose**: Single source of truth for all configuration. Uses `pydantic-settings` to load from `.env` with validation.

```python
# Key settings:
class Settings(BaseSettings):
    gemini_api_key: str | None = None        # Optional — app works without it
    gemini_model: str = "gemini-2.5-flash"   # Configurable model
    gemini_timeout: int = 30                 # Request timeout in seconds
    gemini_max_retries: int = 3              # Retry attempts on transient errors
    cors_origins: list[str] = ["http://localhost:5173"]
    log_level: str = "INFO"
```

**Design Decision**: API key is optional, not required. The app must be fully functional without Gemini — using the heuristic analyzer as fallback.

#### 4.2.2 `models/exceptions.py` — Custom Exception Hierarchy

**Purpose**: Domain exceptions that know nothing about HTTP. Mapped to HTTP responses only at the API boundary.

```
AppError (base)
├── AnalysisError          — General analysis failure
│   ├── GeminiAPIError     — Gemini-specific failures (rate limit, auth, timeout)
│   ├── ResponseParseError — LLM returned malformed/invalid JSON
│   └── ContractTooLong    — Input exceeds token limits
├── ValidationError        — Input validation failures
└── SampleNotFoundError    — Requested sample contract doesn't exist
```

**Why**: This separation ensures the service layer raises clean domain exceptions. The API layer maps them to appropriate HTTP status codes (429 for rate limit, 400 for validation, 503 for API unavailable, etc.).

#### 4.2.3 `models/clause.py` — Domain Models (Pydantic)

**Purpose**: Strict schema for all data flowing through the system. Used both as the Gemini `response_schema` and as the API response model.

```python
class RiskType(str, Enum):
    DANGER = "danger"
    WARNING = "warning"
    SAFE = "safe"

class Clause(BaseModel):
    id: str                    # Unique identifier (e.g., "clause-1")
    text: str                  # EXACT verbatim substring from original contract
    type: RiskType             # danger | warning | safe
    category: str              # Risk category (from our 6 categories)
    title: str                 # Short human-readable title
    explanation: str           # Plain-language risk explanation
    counterclause: str         # Suggested fair alternative
    start_offset: int = -1     # Character start position in original text
    end_offset: int = -1       # Character end position in original text

class AnalysisResult(BaseModel):
    overall_score: int                        # 0-100 fairness score
    summary: str                              # 2-3 sentence risk profile
    risk_counts: dict[str, int]               # {"danger": N, "warning": N, "safe": N}
    category_scores: dict[str, int]           # Per-category scores out of 100
    key_takeaways: list[str]                  # Bullet-point highlights
    clauses: list[Clause]                     # All flagged clauses
    analysis_engine: str = "gemini"           # "gemini" or "heuristic" — transparency
    analysis_duration_ms: int | None = None   # How long analysis took
```

**Design Decision**: `analysis_engine` field tells the user whether results came from AI or heuristic fallback. Transparency builds trust.

#### 4.2.4 `analyzers/base.py` — Analyzer Interface

**Purpose**: Abstract base class so Gemini and Heuristic analyzers share the same contract.

```python
class BaseAnalyzer(ABC):
    @abstractmethod
    async def analyze(self, contract_text: str, contract_type: str | None) -> AnalysisResult:
        """Analyze contract text and return structured results."""
        pass
```

#### 4.2.5 `analyzers/gemini_analyzer.py` — Gemini Integration

**Purpose**: Primary AI analysis engine using Google Gemini API.

**Key Design Decisions**:

| Concern | Solution |
|:--|:--|
| **Structured output** | Use `response_mime_type="application/json"` + `response_schema` (Pydantic model) — never parse raw text |
| **Prompt engineering** | System prompt defines persona ("Senior Legal Counsel"), extraction rules, and output constraints |
| **Retry logic** | Exponential backoff with jitter using `tenacity` library. Retry on 429 (rate limit) and 5xx (server errors). Never retry on 400/403 (client errors). |
| **Timeout** | Hard timeout of 30 seconds. If exceeded → raise `GeminiAPIError` → service falls back to heuristic |
| **Malformed response** | If Pydantic validation fails on LLM output → raise `ResponseParseError` → service falls back |
| **Empty/truncated response** | Check `response.text` is non-empty. Check `response.candidates[0].finish_reason` for safety blocks. |
| **Token limits** | Pre-check contract length. If > ~50k characters (~12k tokens), warn user or chunk the analysis. |

**Error Flow**:
```
Gemini API Call
  ├── Success → Parse JSON → Validate with Pydantic → Return AnalysisResult
  ├── 429 Rate Limit → Retry (up to 3x with backoff) → If exhausted → GeminiAPIError
  ├── 5xx Server Error → Retry (up to 3x with backoff) → If exhausted → GeminiAPIError
  ├── 400/403 Client Error → Immediate GeminiAPIError (bad key, bad request)
  ├── Timeout → GeminiAPIError
  ├── JSON Parse Error → ResponseParseError
  ├── Pydantic Validation Error → ResponseParseError
  └── Safety Filter Block → GeminiAPIError (with specific message)
```

#### 4.2.6 `analyzers/heuristic_analyzer.py` — Fallback Engine

**Purpose**: Rule-based pattern matching engine that works without any API key. Provides instant results.

**How it works**:

1. **Sample matching**: First checks if the input matches a curated sample contract (fuzzy match on first ~30 words). If so, returns the pre-computed expert analysis.

2. **Pattern scanning**: If no sample match, scans contract text line-by-line against a library of regex patterns organized by risk category:
   - Liability patterns: `indemnify|hold harmless|unlimited liability|regardless of fault`
   - IP patterns: `perpetual|irrevocable|worldwide.*royalty-free|train AI|monetize`
   - Payment patterns: `sole discretion|withhold payment|non-refundable`
   - Termination patterns: `without cause|no compensation.*termination`
   - Restrictive patterns: `non-compete|years.*industry|geographic`
   - Access/Privacy patterns: `at any time.*without notice|day or night`

3. **Score calculation**: Uses the weighted formula from §3.3 above.

4. **Offset enrichment**: Calculates exact character offsets for each matched pattern.

**Design Decision**: Heuristic engine is not a "degraded experience" — it's a legitimate first-pass analyzer. For sample contracts, it returns expert-quality pre-computed results that are *better* than a rushed LLM call.

#### 4.2.7 `services/analysis_service.py` — Orchestrator

**Purpose**: The brain. Decides which analyzer to use, handles fallbacks, enriches results with offsets, measures timing.

**Flow**:
```
1. Receive contract text + optional API key
2. Validate input (length, non-empty)
3. Start timer
4. IF api_key available:
     TRY: GeminiAnalyzer.analyze()
       → Enrich clauses with character offsets (OffsetService)
       → Tag result as analysis_engine="gemini"
       → Return
     CATCH GeminiAPIError, ResponseParseError:
       → Log warning with details
       → Fall through to step 5
5. HeuristicAnalyzer.analyze()
   → Enrich clauses with character offsets (OffsetService)
   → Tag result as analysis_engine="heuristic"
   → Return
6. Stop timer, attach duration_ms
```

**Key Guarantee**: This service NEVER raises an exception to the API layer. It always returns an `AnalysisResult`, even if degraded. The only exceptions that reach the API layer are input validation errors.

#### 4.2.8 `services/offset_service.py` — Text Offset Calculator

**Purpose**: Maps each clause's `text` snippet to exact `(start_offset, end_offset)` character positions in the original contract text. This is what enables precise highlighting on the frontend.

**Matching Strategy** (ordered by priority):

1. **Exact substring match**: `contract_text.find(snippet)` — fast, reliable
2. **Normalized whitespace match**: Collapse all whitespace to single spaces in both texts, then match
3. **Fuzzy head match**: Match the first 40 characters of the snippet to find approximate location
4. **Failure**: Set offsets to `(-1, -1)` — frontend renders the clause card but without in-text highlighting

**Why this matters**: LLMs sometimes slightly rephrase or truncate the source text in their `text` field despite instructions to copy verbatim. Each fallback level handles progressively worse LLM compliance.

**Overlap resolution**: After matching all clauses, sort by `start_offset` and remove overlapping regions (keep the first match). This prevents the frontend from rendering nested/broken `<mark>` tags.

#### 4.2.9 `api/error_handlers.py` — Global Exception Handling

**Purpose**: Centralized mapping of domain exceptions → HTTP responses. No `try/except` blocks in route handlers.

| Exception | HTTP Status | User-Facing Message |
|:--|:--|:--|
| `ValidationError` | 400 | "Invalid input: {details}" |
| `ContractTooLong` | 413 | "Contract text exceeds maximum length of {limit} characters" |
| `GeminiAPIError` (rate limit) | 429 | "AI service is temporarily busy. Please try again in a moment." |
| `GeminiAPIError` (auth) | 401 | "Invalid Gemini API key. Please check your key and try again." |
| `GeminiAPIError` (other) | 503 | "AI analysis service is currently unavailable. Results generated using built-in analysis engine." |
| `SampleNotFoundError` | 404 | "Sample contract not found" |
| `Exception` (catch-all) | 500 | "An unexpected error occurred. Please try again." + server-side log |

**Response Schema** (consistent for all errors):
```json
{
  "error": true,
  "error_code": "GEMINI_RATE_LIMIT",
  "message": "AI service is temporarily busy. Please try again in a moment.",
  "details": null
}
```

### 4.3 API Endpoints

| Method | Path | Purpose | Request | Response |
|:--|:--|:--|:--|:--|
| `GET` | `/api/health` | Health check + Gemini connectivity status | — | `{status, gemini_configured, gemini_reachable}` |
| `GET` | `/api/samples` | List all sample contracts with pre-computed analyses | — | `{samples: SampleContract[]}` |
| `POST` | `/api/analyze` | Analyze contract text | `{contract_text, api_key?, contract_type?}` | `AnalysisResult` |

---

## 5. Frontend Design (Vite + React + TypeScript + Tailwind)

### 5.1 Project Structure (Feature-Based)

```
Frontend/
├── index.html
├── vite.config.ts              # Vite config + API proxy + Tailwind plugin
├── tailwind.config.ts          # Tailwind customization (if needed)
├── tsconfig.json
├── package.json
│
└── src/
    ├── main.tsx                # React DOM entry point
    ├── App.tsx                 # Root component + layout shell
    ├── index.css               # Tailwind imports + custom highlight styles
    │
    ├── types/
    │   └── index.ts            # Shared TypeScript interfaces (Clause, AnalysisResult, etc.)
    │
    ├── services/
    │   └── api.ts              # HTTP client with error handling (fetch wrapper)
    │
    ├── context/
    │   └── AnalysisContext.tsx  # React Context for shared analysis state
    │
    ├── hooks/
    │   ├── useAnalysis.ts      # Hook for triggering analysis + managing loading/error states
    │   └── useSamples.ts       # Hook for fetching sample contracts on mount
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.tsx       # Top navigation bar + sample buttons + action buttons
    │   │   └── TwoPanel.tsx     # Responsive split layout container
    │   │
    │   ├── contract/
    │   │   ├── ContractViewer.tsx       # Left panel orchestrator (editor + reader modes)
    │   │   ├── HighlightedText.tsx      # Renders contract text with <mark> highlights
    │   │   ├── ContractEditor.tsx       # Raw textarea for editing contract text
    │   │   └── ContractToolbar.tsx      # Mode toggle, import, copy, word count
    │   │
    │   ├── dashboard/
    │   │   ├── Dashboard.tsx            # Right panel orchestrator
    │   │   ├── FairnessGauge.tsx        # SVG radial score meter (0-100)
    │   │   ├── RiskSummary.tsx          # Executive summary + key takeaways
    │   │   ├── CategoryBreakdown.tsx    # Per-category progress bars
    │   │   ├── ClauseFilterBar.tsx      # Filter pills (All/Danger/Warning/Safe) + search
    │   │   └── ClauseCard.tsx           # Individual expandable clause card
    │   │
    │   └── shared/
    │       ├── ApiKeyModal.tsx          # Gemini API key configuration modal
    │       ├── ErrorBanner.tsx          # Inline error notification banner
    │       ├── LoadingOverlay.tsx       # Full-panel loading skeleton
    │       └── CopyButton.tsx          # Reusable copy-to-clipboard button
    │
    └── utils/
        └── export.ts            # Markdown report export utility
```

### 5.2 State Management Strategy

We use **React Context** (not Redux/Zustand) because the state surface is small and well-defined:

```typescript
interface AnalysisState {
  // Input
  contractText: string;
  setContractText: (text: string) => void;
  
  // Analysis results
  analysis: AnalysisResult | null;
  
  // UI state
  activeClauseId: string | null;
  setActiveClauseId: (id: string | null) => void;
  viewMode: 'reader' | 'editor';
  setViewMode: (mode: 'reader' | 'editor') => void;
  
  // Async state
  isAnalyzing: boolean;
  analysisError: string | null;
  
  // Actions
  triggerAnalysis: () => Promise<void>;
  loadSample: (sample: SampleContract) => void;
  replaceClause: (originalText: string, replacement: string) => void;
  clearAll: () => void;
  
  // API Key
  apiKey: string;
  setApiKey: (key: string) => void;
}
```

**Why Context over Zustand**: Our state is tightly coupled to a single page with two panels. There's no routing, no deeply nested component trees, and no need for persistence beyond `localStorage` for the API key. Context with `useReducer` is the right tool at this scale.

### 5.3 Component Design Details

#### 5.3.1 `HighlightedText.tsx` — The Core UI Challenge

This is the most technically complex frontend component. It takes raw contract text + clause offset data and renders it with interactive colored highlights.

**Algorithm**:
```
1. Filter clauses to those with valid offsets (start >= 0, end > start)
2. Sort clauses by start_offset ascending
3. Remove overlapping regions (keep first match)
4. Walk through contract text character by character:
   - If current position is outside any clause → render as plain <span>
   - If current position enters a clause → render as <mark> with appropriate class
5. Each <mark> element:
   - Gets a unique id: `text-clause-{clause.id}`
   - Gets a CSS class: `highlight-danger` | `highlight-warning` | `highlight-safe`
   - Gets an `active` class if it matches `activeClauseId`
   - Has an onClick handler that calls `setActiveClauseId`
```

**Error Handling**:
- If no clauses have valid offsets → render plain text without highlights (no crash)
- If contract text changes after analysis → highlights may be stale; show a subtle "Re-analyze for updated highlights" prompt
- If clauses overlap → resolve conflicts by keeping the first clause encountered

**Performance Considerations**:
- Memoize the segment array with `useMemo` (depends on `contractText`, `clauses`, `activeClauseId`)
- For very long contracts (>10k words), consider virtualized rendering

#### 5.3.2 `ClauseCard.tsx` — Expandable Dashboard Card

Each card shows:
1. **Header** (always visible): Risk icon, category tag, severity badge, title, expand/collapse toggle
2. **Body** (expandable):
   - Original clause text (quoted, monospaced)
   - AI risk explanation (indigo accent box)
   - Suggested counterclause (emerald accent box) with two action buttons:
     - **Copy Counterclause**: Copies to clipboard with visual confirmation
     - **Replace in Contract**: Swaps the original text in the left panel with the counterclause

**Error Handling**:
- If `clause.counterclause` is empty or equals "Standard clause; no change necessary" → hide the Replace button, show only a "No changes needed" note
- If clipboard API is unavailable (HTTP context) → show a manual select+copy fallback
- If replacement text doesn't match original (already replaced) → show "Already applied" state

#### 5.3.3 `FairnessGauge.tsx` — Score Visualization

**SVG-based radial gauge** with:
- Animated stroke that fills proportionally to the score (CSS transition on `stroke-dashoffset`)
- Color that interpolates based on score band (red → amber → emerald)
- Numeric score in center
- Status badge below ("Predatory / High Risk", "Moderate Risk", "Fair & Protective")

**Edge Cases**:
- Score of exactly 0 → Full red ring, "Extremely Predatory" label
- Score of exactly 100 → Full green ring, "Exemplary Fairness" label
- Score is `null`/`undefined` → Show "—" and "Awaiting Analysis" label

### 5.4 API Client (`services/api.ts`)

**Purpose**: Centralized HTTP client that handles errors consistently across all API calls.

```typescript
// Core design:
async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  // 1. Make request with timeout (AbortController, 35s)
  // 2. Check response.ok
  //    - If not ok: parse error body → throw ApiError with code + message
  // 3. Parse JSON response
  // 4. Return typed result
}

// Error types the frontend can handle:
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string
  ) { ... }
}
```

**Frontend Error Handling Strategy**:

| Error Scenario | User Experience |
|:--|:--|
| Network failure (backend down) | Show ErrorBanner: "Cannot connect to analysis server. Please ensure the backend is running." |
| 429 Rate Limit | Show ErrorBanner: "AI service is busy. Try again in a few seconds." + auto-retry after 5s |
| 401 Bad API Key | Show ErrorBanner: "Invalid API key" + open ApiKeyModal |
| 503 Gemini Unavailable | Show result with note: "Results from built-in analysis engine (Gemini unavailable)" |
| 413 Contract Too Long | Show ErrorBanner: "Contract exceeds maximum length. Try a shorter excerpt." |
| 500 Unexpected Error | Show ErrorBanner: "Something went wrong. Please try again." |
| Timeout (35s) | Show ErrorBanner: "Analysis is taking longer than expected. Try a shorter contract." |

### 5.5 Styling Strategy

**Tailwind CSS** with these custom additions in `index.css`:

```css
/* Custom highlight classes (not Tailwind utilities — these need hover/active states) */
.highlight-danger     { /* Red: bg, border-bottom, hover glow */ }
.highlight-warning    { /* Amber: bg, border-bottom, hover glow */ }
.highlight-safe       { /* Emerald: bg, border-bottom, hover glow */ }
.highlight-*.active   { /* Ring + elevated background for active clause */ }
```

**Dark theme only** — ClauseLens uses a deep slate/navy palette (`#090d16` base) with:
- Indigo accents for primary actions and AI elements
- Rose/Red for danger indicators
- Amber for warning indicators
- Emerald for safe/positive indicators
- Glassmorphism panels (`backdrop-blur`, semi-transparent borders)

---

## 6. Data Flow — Complete Request Lifecycle

Here's the full journey of a user clicking "Audit Contract":

```
USER clicks "Audit Contract"
│
├─ Frontend: useAnalysis hook
│   ├─ Set isAnalyzing = true, analysisError = null
│   ├─ Call api.analyzeContract(contractText, apiKey)
│   │
│   ├─ services/api.ts
│   │   ├─ POST /api/analyze { contract_text, api_key }
│   │   ├─ AbortController timeout: 35 seconds
│   │   │
│   │   ├─ BACKEND receives request
│   │   │   ├─ api/router.py: Validates request body (Pydantic)
│   │   │   │   └─ Invalid → 400 + ErrorResponse
│   │   │   │
│   │   │   ├─ services/analysis_service.py: orchestrate()
│   │   │   │   ├─ Check contract length (< 100k chars)
│   │   │   │   │   └─ Too long → raise ContractTooLong
│   │   │   │   │
│   │   │   │   ├─ IF api_key provided:
│   │   │   │   │   ├─ TRY: gemini_analyzer.analyze()
│   │   │   │   │   │   ├─ Build prompt (prompts.py)
│   │   │   │   │   │   ├─ Call Gemini API with response_schema
│   │   │   │   │   │   │   ├─ Retry on 429/5xx (up to 3x, exp backoff)
│   │   │   │   │   │   │   ├─ Timeout: 25 seconds per attempt
│   │   │   │   │   │   │   └─ Parse + validate response with Pydantic
│   │   │   │   │   │   └─ Return raw AnalysisResult (no offsets yet)
│   │   │   │   │   │
│   │   │   │   │   └─ CATCH any GeminiAPIError / ResponseParseError:
│   │   │   │   │       └─ Log warning, fall through to heuristic
│   │   │   │   │
│   │   │   │   ├─ ELSE (no key or Gemini failed):
│   │   │   │   │   └─ heuristic_analyzer.analyze()
│   │   │   │   │       ├─ Check sample match (fuzzy first-30-words)
│   │   │   │   │       ├─ If sample: return pre-computed analysis
│   │   │   │   │       └─ If not: regex pattern scan + score calc
│   │   │   │   │
│   │   │   │   ├─ offset_service.enrich_offsets(contract_text, result)
│   │   │   │   │   ├─ For each clause: find exact substring offset
│   │   │   │   │   ├─ Fallback: normalized whitespace match
│   │   │   │   │   ├─ Fallback: fuzzy head match
│   │   │   │   │   └─ Sort by offset, resolve overlaps
│   │   │   │   │
│   │   │   │   └─ Attach analysis_engine tag + duration_ms
│   │   │   │
│   │   │   └─ Return 200 + AnalysisResult JSON
│   │   │
│   │   └─ Frontend receives response
│   │       ├─ Success → return parsed AnalysisResult
│   │       └─ Error → throw ApiError with code + message
│   │
│   ├─ ON SUCCESS:
│   │   ├─ Set analysis = result
│   │   ├─ Set viewMode = 'reader'
│   │   ├─ Set activeClauseId = first clause id
│   │   └─ Set isAnalyzing = false
│   │
│   └─ ON ERROR:
│       ├─ Set analysisError = error.message
│       ├─ Set isAnalyzing = false
│       └─ If error is 401 → open ApiKeyModal
│
└─ UI re-renders with results
    ├─ Left Panel: HighlightedText renders colored <mark> elements
    └─ Right Panel: Dashboard renders gauge + cards
```

---

## 7. Sample Contracts Strategy

We curate **3 sample contracts** that demonstrate ClauseLens's range:

| Sample | Contract Type | Risk Profile | # Dangerous | # Ambiguous | # Fair | Score |
|:--|:--|:--|:--|:--|:--|:--|
| **Freelance Dev Agreement** | Freelance / Consulting | Heavily predatory | 5 | 2 | 1 | ~38 |
| **Apartment Lease** | Real Estate / Housing | Multiple traps | 4 | 1 | 1 | ~45 |
| **SaaS Terms of Service** | Software / Terms | Data exploitation | 3 | 1 | 1 | ~52 |

Each sample includes:
- Full contract text (realistic but fictional)
- Pre-computed `AnalysisResult` with expert-quality explanations and counterclauses
- Pre-calculated character offsets (no LLM needed)

**Why pre-computed**: Sample analyses are the "gold standard" — they demonstrate the app's capabilities without any API dependency, they load instantly, and they serve as benchmark examples for testing.

---

## 8. Error Handling & Fallback Summary

> [!WARNING]
> This section consolidates all error handling strategies across the entire stack. Every failure mode has a planned recovery path.

### 8.1 Backend Error Matrix

| Layer | Failure | Detection | Recovery | User Impact |
|:--|:--|:--|:--|:--|
| **Input** | Empty contract text | Pydantic validation | 400 response | "Contract text is required" |
| **Input** | Contract too long | Length check in service | 413 response | "Text exceeds 100,000 character limit" |
| **Gemini** | Invalid API key | 403 from API | Immediate error (no retry) | "Invalid API key" + fallback to heuristic |
| **Gemini** | Rate limited (429) | HTTP status | Retry 3x with exp backoff + jitter | Transparent retry; if exhausted → heuristic fallback |
| **Gemini** | Server error (5xx) | HTTP status | Retry 3x with exp backoff | If exhausted → heuristic fallback |
| **Gemini** | Timeout | asyncio.timeout | After 25s → abort | Heuristic fallback |
| **Gemini** | Malformed JSON | json.JSONDecodeError | Catch + log | Heuristic fallback |
| **Gemini** | Invalid schema | Pydantic ValidationError | Catch + log | Heuristic fallback |
| **Gemini** | Safety filter block | finish_reason check | Detect + log | Heuristic fallback + note about content filters |
| **Offset** | Snippet not found in text | find() returns -1 | Set offset to (-1, -1) | Clause card shown but no in-text highlight |
| **Heuristic** | No patterns match | Empty results | Return single "safe" general clause | Minimal but non-empty result |

### 8.2 Frontend Error Matrix

| Failure | Detection | Recovery | User Experience |
|:--|:--|:--|:--|
| Backend unreachable | fetch throws TypeError | Show ErrorBanner | "Cannot connect to server. Is the backend running?" |
| Slow response | AbortController timeout | Show ErrorBanner | "Analysis timed out. Try a shorter contract." |
| API returns error JSON | response.ok === false | Parse error, show ErrorBanner | Display server's error message |
| Clipboard API unavailable | navigator.clipboard check | Fallback to textarea+select | Manual copy prompt |
| Contract text changed after analysis | Compare text hash | Show warning banner | "Contract was modified. Re-analyze for updated highlights." |
| No clauses have valid offsets | All offsets === -1 | Render plain text + cards | Cards work, but no in-text highlighting |

---

## 9. Build Roadmap — Phased Execution

> [!TIP]
> Each phase is designed to produce a working, testable increment. We never write code that can't be verified immediately.

### Phase 1: Foundation & Backend Core
**Goal**: Working API that returns hardcoded sample analyses

- [ ] Initialize Backend project (venv, dependencies, `.env.example`)
- [ ] Create `config.py` (pydantic-settings)
- [ ] Create `models/` (domain models, exception hierarchy)
- [ ] Create `data/sample_contracts.py` (3 curated samples with pre-computed analyses)
- [ ] Create `services/offset_service.py` (text offset calculator with all fallback levels)
- [ ] Create `api/schemas.py` (request/response models)
- [ ] Create `api/error_handlers.py` (global exception handlers)
- [ ] Create `api/router.py` (GET /health, GET /samples, POST /analyze — samples only)
- [ ] Create `main.py` (FastAPI app factory with CORS, middleware, error handlers)
- [ ] **Verify**: Hit all endpoints with curl, confirm structured error responses

### Phase 2: Heuristic Analyzer
**Goal**: POST /analyze returns real pattern-based analysis for any contract text

- [ ] Create `analyzers/base.py` (abstract interface)
- [ ] Create `analyzers/heuristic_analyzer.py` (regex patterns, sample matching, score calculation)
- [ ] Integrate into `services/analysis_service.py` (orchestration + offset enrichment)
- [ ] **Verify**: POST arbitrary contract text → get categorized clauses with offsets

### Phase 3: Gemini Integration
**Goal**: POST /analyze uses Gemini API when key is provided, with full error handling

- [ ] Create `analyzers/prompts.py` (system prompt, prompt templates)
- [ ] Create `analyzers/gemini_analyzer.py` (API call with retry, schema enforcement, error handling)
- [ ] Update `services/analysis_service.py` (Gemini-first, heuristic-fallback orchestration)
- [ ] **Verify**: Test with valid key, invalid key, no key. Confirm fallback works. Confirm retry on simulated failures.

### Phase 4: Frontend Foundation
**Goal**: Two-panel layout renders with placeholder content

- [ ] Initialize Vite + React + TypeScript project
- [ ] Install & configure Tailwind CSS
- [ ] Create `index.css` (dark theme base + highlight classes)
- [ ] Create `types/index.ts` (TypeScript interfaces mirroring backend models)
- [ ] Create `services/api.ts` (HTTP client with error handling)
- [ ] Create `context/AnalysisContext.tsx` (state management)
- [ ] Create `components/layout/` (Navbar, TwoPanel)
- [ ] **Verify**: App renders dark two-panel layout with navbar

### Phase 5: Left Panel — Contract Viewer
**Goal**: Contract text with interactive colored highlights

- [ ] Create `ContractEditor.tsx` (textarea for editing)
- [ ] Create `HighlightedText.tsx` (offset-based highlighting engine)
- [ ] Create `ContractToolbar.tsx` (mode toggle, import, copy, word count)
- [ ] Create `ContractViewer.tsx` (orchestrates editor + reader + toolbar)
- [ ] **Verify**: Load sample → see highlighted text with red/yellow/green marks

### Phase 6: Right Panel — Dashboard
**Goal**: Full audit dashboard with interactive clause cards

- [ ] Create `FairnessGauge.tsx` (SVG radial meter)
- [ ] Create `RiskSummary.tsx` (summary + takeaways)
- [ ] Create `CategoryBreakdown.tsx` (progress bars per category)
- [ ] Create `ClauseFilterBar.tsx` (filter pills + search)
- [ ] Create `ClauseCard.tsx` (expandable card with copy/replace actions)
- [ ] Create `Dashboard.tsx` (orchestrates all dashboard components)
- [ ] **Verify**: Load sample → see full dashboard with gauge, cards, filters

### Phase 7: Integration & Interactivity
**Goal**: Bidirectional sync between panels, API key modal, export

- [ ] Wire `useAnalysis` hook (analysis trigger + loading/error states)
- [ ] Wire `useSamples` hook (fetch samples on mount, load first by default)
- [ ] Implement bidirectional clause selection (click highlight → scroll to card, click card → scroll to highlight)
- [ ] Implement "Replace in Contract" (swap original text with counterclause)
- [ ] Create `ApiKeyModal.tsx`
- [ ] Create `ErrorBanner.tsx` + `LoadingOverlay.tsx`
- [ ] Implement markdown report export
- [ ] **Verify**: Full end-to-end flow — paste text, analyze, click clauses, replace, export

### Phase 8: Polish & Edge Cases
**Goal**: Production-ready polish

- [ ] Handle all edge cases from §8.2 error matrix
- [ ] Add loading skeletons (not just a spinner)
- [ ] Add "analysis engine" indicator ("Powered by Gemini" vs "Built-in Analysis")
- [ ] Add legal disclaimer footer ("Not legal advice")
- [ ] Responsive layout testing (mobile stacks vertically)
- [ ] Performance: memoize expensive renders, test with large contracts
- [ ] Final visual polish: animations, transitions, micro-interactions

---

## 10. Key Technical Decisions — Rationale

| Decision | Choice | Why Not the Alternative |
|:--|:--|:--|
| **State management** | React Context + useReducer | Zustand/Redux are overkill for single-page, single-concern state |
| **API client** | Raw fetch + custom wrapper | Axios adds unnecessary bundle weight for 3 endpoints |
| **Tailwind version** | Latest via `@tailwindcss/vite` plugin | User explicitly requested Tailwind CSS |
| **Gemini SDK** | `google-genai` (modern SDK) | Official SDK with built-in retry, response_schema support |
| **Retry library** | `tenacity` | Industry standard for Python retry patterns with decorators |
| **Text highlighting** | Character offset + `<mark>` tags | More reliable than regex-in-browser; offsets computed server-side |
| **Sample data** | In-memory Python dict | No database needed for 3 static samples; instant load |
| **Dark theme only** | Single coherent dark palette | Reduces CSS complexity; legal/security tools conventionally use dark themes |
| **No database** | Stateless API | No user accounts, no persistence needed. Contract text is ephemeral. |
