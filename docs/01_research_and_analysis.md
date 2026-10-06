# 📑 ClauseLens — Research & Competitive Analysis

> **Document Purpose**: Capture everything we learned from researching the market, existing tools, open-source frameworks, and technical best practices — *before* making any design decisions. Every choice in the Architecture and Implementation Plan documents traces back to a finding here.
>
> **Last Updated**: 2026-10-05

---

## Table of Contents

1. [Problem Statement & Target User](#1-problem-statement--target-user)
2. [Competitive Landscape](#2-competitive-landscape)
3. [Open-Source Models & Frameworks](#3-open-source-models--frameworks)
4. [Risk Scoring Methodology (Industry Standard)](#4-risk-scoring-methodology-industry-standard)
5. [LLM Integration Best Practices](#5-llm-integration-best-practices)
6. [Gemini API — Structured Output & Error Handling](#6-gemini-api--structured-output--error-handling)
7. [FastAPI Production Patterns](#7-fastapi-production-patterns)
8. [React Text Annotation Patterns](#8-react-text-annotation-patterns)
9. [Frontend Architecture Patterns](#9-frontend-architecture-patterns)
10. [Consolidated Takeaways](#10-consolidated-takeaways)

---

## 1. Problem Statement & Target User

**Problem**: Everyday people sign contracts — apartment leases, freelance agreements, SaaS terms of service, NDAs — without understanding the legal implications. Predatory clauses like unlimited liability, broad IP assignment, or one-sided termination rights are buried in dense legalese.

**Target User**: Non-lawyers — freelancers, renters, small business owners, consumers — who want a quick, plain-language audit of a contract before signing. NOT enterprise legal teams (they have LegalOn/Luminance).

**Core Insight**: The gap in the market is between enterprise tools (LegalOn at $500+/month) and consumer chatbots (DoNotPay's shallow pattern matching). ClauseLens fills this with deep AI analysis delivered through an accessible, instant web interface.

---

## 2. Competitive Landscape

### 2.1 Tools Studied

| Tool | Category | Target User | Pricing Model | Core Approach |
|:--|:--|:--|:--|:--|
| **LegalOn** | Enterprise AI Review | In-house legal teams, law firms | Enterprise subscription | Attorney-built playbooks + LLM risk detection |
| **Luminance** | Enterprise AI Review | M&A teams, large law firms | Enterprise subscription | AI anomaly detection; understands clause *intent* |
| **Justee AI** | Accessible Legal AI | SMBs, individuals, small legal teams | Free-to-start / tiered | Cloud-based document analysis + compliance flagging |
| **DoNotPay** | Consumer Advocacy | Individual consumers | Subscription ($3/month) | Chatbot automation for common legal tasks |
| **Spellbook / CoCounsel** | Integrated Copilot | Legal professionals using MS Word | Enterprise subscription | Word-integrated AI drafting + research |

### 2.2 Detailed Analysis

#### LegalOn — What They Do Well
- **Playbook-driven analysis**: Compares incoming contracts against pre-defined "gold standard" templates. Deviations are flagged automatically.
- **Audit trails**: Every AI finding links back to the exact source text with "Exact Quote" features.
- **Consistency**: Attorney-crafted playbooks mean the AI's risk assessments are calibrated and reproducible — not random LLM outputs.
- **Risk grades**: Assigns immediate A–F risk grades so legal teams can triage.

> **Lesson for ClauseLens**: Adopt the "grounded extraction" pattern — every flagged clause MUST include the exact verbatim text from the original contract. No paraphrasing. Also adopt category-based risk grading.

#### LegalOn — Where They Fall Short
- Enterprise-only pricing and onboarding
- Requires playbook setup before use — no "instant" value
- Not accessible to non-lawyers

#### Justee AI — What They Do Well
- **Color-coded risk highlights**: Uses visual color coding to flag risk levels — accessible for non-lawyers
- **Free-to-start**: Low barrier to entry; users can check one document without committing
- **Document comparison**: Can compare two versions of a contract

> **Lesson for ClauseLens**: Color-coded highlights (red/yellow/green) are proven UX for non-legal users. Copy this pattern directly.

#### Justee AI — Where They Fall Short
- Limited customization; no ability to define your own risk rules
- Lacks actionable counterclauses — tells you something is risky but doesn't help you fix it
- No interactive panel-to-panel linking

#### DoNotPay — What They Do Well
- **Consumer-first UX**: Extremely simple, chatbot-driven interface
- **Broad coverage**: Handles subscriptions, tickets, refunds, disputes — not just contracts
- **Pattern matching for common predatory terms**: Pre-defined rules for known consumer rights violations

> **Lesson for ClauseLens**: Works without any setup or API keys. Users get value immediately. Our heuristic fallback engine should provide this same instant-value experience.

#### DoNotPay — Where They Fall Short
- Shallow analysis: pre-defined patterns only, no contextual understanding
- Regulatory scrutiny over "robot lawyer" marketing — we must include clear disclaimers
- Cannot analyze arbitrary contract text; limited to pre-defined flows

#### Luminance — What They Do Well
- **Contextual understanding**: Goes beyond keyword matching to understand clause *intent* and the relationship between clauses
- **Anomaly detection**: Identifies unusual patterns even when phrasing varies from standard language

> **Lesson for ClauseLens**: Our Gemini integration should use persona-based prompting ("Senior Legal Counsel") to achieve this contextual understanding, not just regex.

### 2.3 Gap Analysis — Our Differentiator

| Feature | LegalOn | Justee | DoNotPay | ClauseLens (Ours) |
|:--|:--|:--|:--|:--|
| Instant, no-signup access | ❌ | ⚠️ (account needed) | ⚠️ (subscription) | ✅ |
| Works without API key | ❌ | ❌ | ✅ | ✅ |
| Deep AI analysis | ✅ | ⚠️ | ❌ | ✅ |
| Plain-language explanations | ⚠️ | ✅ | ✅ | ✅ |
| Actionable counterclauses | ⚠️ | ❌ | ❌ | ✅ |
| Interactive two-panel UI | ❌ | ❌ | ❌ | ✅ |
| In-place clause replacement | ❌ | ❌ | ❌ | ✅ |
| Consumer-priced | ❌ | ✅ | ✅ | ✅ (free) |

---

## 3. Open-Source Models & Frameworks

### 3.1 Available Tools for Legal NLP (2026)

| Tool / Model | What It Does | Relevance to ClauseLens |
|:--|:--|:--|
| **Ivo Sage** (Oct 2026) | Open-source model post-trained for long-horizon contract work | Could be a future self-hosted alternative to Gemini |
| **OpenContracts** | Open-source document intelligence platform | Annotation and corpus management patterns worth studying |
| **Spark NLP** | Commercial-grade legal/financial entity models | Pre-built legal entity recognition; too heavy for our use case |
| **LangExtract** | Grounded extraction — links AI output back to source text | The "grounded extraction" pattern is critical for us |

### 3.2 Key Technical Concepts from the Ecosystem

1. **Grounded Extraction**: Every AI-generated insight must trace back to specific text in the contract. This is non-negotiable for legal compliance and user trust. We implement this via character offsets.

2. **Clause-Level Segmentation**: Don't analyze the contract as a blob. Break it into logical clauses/sections, analyze each independently, then aggregate scores. Our Gemini prompt instructs the AI to do this.

3. **Playbook Comparison**: The gold standard in enterprise tools. For ClauseLens, our "playbook" is the system prompt that defines what fair vs. predatory terms look like for each clause category.

4. **Human-in-the-Loop**: AI is a "first-pass screening tool." The most successful deployments always pair AI flags with human review. We must include clear disclaimers.

---

## 4. Risk Scoring Methodology (Industry Standard)

### 4.1 How Professional Tools Score Contracts

Research into legal risk scoring algorithms reveals a consistent methodology:

```
1. IDENTIFY    → Define risk categories relevant to the contract type
2. EXTRACT     → NLP/AI isolates individual clauses
3. EVALUATE    → Compare each clause against a standard ("playbook")
4. SCORE       → Assign numerical score to each deviation
5. WEIGHT      → Apply category-level multipliers (liability > notification delays)
6. AGGREGATE   → Weighted sum → normalized to 0–100 scale
7. CLASSIFY    → Map score to risk band (Low / Medium / High / Critical)
```

### 4.2 Common Predatory Clause Categories

From legal industry research, these are the categories most frequently flagged:

| Category | What Makes It Predatory | Frequency in Consumer Contracts |
|:--|:--|:--|
| **Liability & Indemnification** | One-sided indemnity, uncapped liability, "regardless of fault" | Very High |
| **Intellectual Property & Data** | Perpetual IP assignment, data monetization, AI training rights | High |
| **Payment & Financial** | Discretionary withholding, non-refundable fees, stealth price hikes | High |
| **Termination & Exit** | Asymmetric notice, no compensation on early termination | Medium-High |
| **Restrictive Covenants** | Multi-year non-competes, broad geographic scope | Medium |
| **Privacy & Access** | Unannounced entry, waived safety obligations | Medium |

### 4.3 Weighted Scoring Formula (Research-Backed)

```
Total Score = 100 - Σ(clause_penalty × category_weight × severity_multiplier)

- clause_penalty:       danger=15, warning=7, safe=0
- category_weight:      0.10 to 0.25 (based on financial impact potential)
- severity_multiplier:  1.0 (standard) to 2.0 (extreme — e.g., unlimited liability)
```

This formula is derived from how enterprise CLM platforms (Icertis, LinkSquares) implement their internal scoring, adapted for consumer-facing simplicity.

### 4.4 Score Bands

| Score Range | Label | Action Required |
|:--|:--|:--|
| 75–100 | Fair & Protective | Standard terms; minimal concerns |
| 50–74 | Moderate Risk | Review flagged clauses before signing |
| 25–49 | High Risk | Negotiate or seek legal counsel |
| 0–24 | Predatory | Do not sign without professional legal review |

---

## 5. LLM Integration Best Practices

### 5.1 Architecture: Staged Pipeline, Not Single-Agent Loop

Research strongly recommends against the "chat with document" pattern. Instead:

```
Document → Structured Parsing → Extraction Agents → Verification → Output
```

For ClauseLens, this translates to:
1. **Input**: Raw contract text (no parsing needed — it's already plain text)
2. **Extraction**: Gemini identifies and classifies individual clauses
3. **Verification**: Pydantic schema validates the LLM output structure
4. **Enrichment**: Offset service maps clauses back to exact text positions
5. **Output**: Structured AnalysisResult with full traceability

### 5.2 Schema Enforcement

> [!IMPORTANT]
> "Every LLM response must be parsed into a strict Pydantic model." — Consistent finding across all research sources.

- Use `response_mime_type="application/json"` to prevent markdown/freeform output
- Use `response_schema` with a Pydantic model to enforce exact field names and types
- Add a secondary Pydantic validation step after parsing (belt-and-suspenders)

### 5.3 Task Decomposition

Complex analysis should be broken into steps within the prompt:
1. First, identify all notable clauses in the contract
2. Then, classify each clause (danger / warning / safe)
3. Then, explain each clause in plain language
4. Then, draft a fair counterclause for each
5. Finally, calculate an overall score

This "chain of thought" approach within a single prompt improves accuracy vs. asking for everything at once.

### 5.4 Failure Categories

| Category | Examples | Strategy |
|:--|:--|:--|
| **Technical Failures** | Network errors, rate limits (429), server errors (5xx), timeouts | Exponential backoff with jitter; circuit breaker to fallback |
| **Semantic Failures** | Hallucinations, malformed JSON, missing fields, tool errors | Schema enforcement + Pydantic validation; fallback to heuristic |
| **Content Failures** | Safety filter blocks, empty responses, truncated output | Detect via `finish_reason`; fallback to heuristic with note |

### 5.5 The "Fail Safely" Principle

```
If the LLM fails → don't crash.
Return a "Partial Result" clearly labeled with what could not be analyzed.
The heuristic analyzer is the safety net, not a degraded experience.
```

---

## 6. Gemini API — Structured Output & Error Handling

### 6.1 Recommended SDK & Model

- **SDK**: `google-genai` (the modern Python SDK, not the legacy `google-generativeai`)
- **Model**: `gemini-2.5-flash` — best balance of speed, reasoning quality, and cost for extraction tasks
- **Fallback Model**: If `2.5-flash` is unavailable, try `gemini-2.0-flash`

### 6.2 Structured Output Pattern

```python
from pydantic import BaseModel
from google import genai
from google.genai import types

# Define schema as Pydantic model
class ClauseAnalysis(BaseModel):
    clauses: list[Clause]
    overall_score: int
    # ... etc

# Call with schema enforcement
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt,
    config=types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        response_mime_type="application/json",
        response_schema=ClauseAnalysis,
        temperature=0.2  # Low temperature for consistent factual extraction
    )
)

# Access parsed object
result = response.parsed  # Already a Pydantic object
```

### 6.3 Prompt Engineering Findings

Best practices for legal clause extraction prompts:

1. **Persona prompting**: "You are ClauseLens AI, a senior legal counsel specializing in consumer contract review..."
2. **Explicit constraints**: "The `text` field MUST be an EXACT VERBATIM substring from the input contract. Do not paraphrase."
3. **Chain of thought**: "First identify all notable clauses, then classify each, then explain, then draft counterclauses."
4. **Output guardrails**: "Return ONLY valid JSON matching the schema. No preamble. No markdown."
5. **Optional fields**: Use `Optional` types for fields the model might not have data for, preventing hallucination

### 6.4 Error Handling Matrix (Gemini-Specific)

| Error | HTTP Code | Retry? | Max Attempts | Backoff |
|:--|:--|:--|:--|:--|
| Rate Limited | 429 | ✅ Yes | 3 | Exponential + jitter (1s → 4s → 16s) |
| Server Error | 5xx | ✅ Yes | 3 | Exponential + jitter |
| Bad Request | 400 | ❌ No | — | Immediate error (fix request) |
| Auth Error | 403 | ❌ No | — | Immediate error (bad API key) |
| Timeout | — | ✅ Yes | 2 | Longer timeout on retry |
| JSON Parse Error | — | ❌ No | — | Fallback to heuristic |
| Safety Block | — | ❌ No | — | Fallback + user notification |

### 6.5 Key Gotcha: Safety Filters

Gemini's safety filters can sometimes trigger on legal contract text (especially liability, damages, or personal injury language). If `response.candidates[0].finish_reason` indicates a safety block:
- Don't retry (won't help)
- Fall back to heuristic analyzer
- Inform user: "AI content filters were triggered. Results generated using built-in analysis engine."

---

## 7. FastAPI Production Patterns

### 7.1 Layered Architecture

```
Routes (HTTP layer) → Services (Business logic) → Analyzers (AI/Pattern engines)
```

- **Routes**: Only deal with HTTP. Validate request, call service, return response.
- **Services**: Contain business logic. Raise domain exceptions. Know nothing about HTTP.
- **Analyzers**: Specialized engines. Know nothing about services or HTTP.

### 7.2 Exception Handling Strategy

**Do NOT scatter try/except in routes.** Instead:

1. Define custom exception classes in `models/exceptions.py` (no HTTP knowledge)
2. Register global exception handlers with `@app.exception_handler()` that map domain exceptions → HTTP responses
3. Implement a catch-all `Exception` handler to prevent stack trace leakage

### 7.3 Structured Error Response Schema

Every error response must follow a consistent format:

```json
{
  "error": true,
  "error_code": "GEMINI_RATE_LIMIT",
  "message": "AI service is temporarily busy. Please try again in a moment.",
  "details": null
}
```

### 7.4 Middleware Usage

Use middleware ONLY for cross-cutting concerns:
- Request/correlation ID injection (for log tracing)
- Request timing (attach `X-Response-Time` header)
- CORS (using FastAPI's built-in CORSMiddleware)

Do NOT use middleware for business logic or fine-grained error handling.

### 7.5 Configuration

Use `pydantic-settings` with `.env` files. Key principle: **the app must start and work even with zero configuration** (no API key = heuristic mode).

---

## 8. React Text Annotation Patterns

### 8.1 Architecture Recommendations

From researching React annotation components:

1. **Container/Presentational Pattern**: Separate logic (state, event handling) from UI (rendering highlights). The `ContractViewer` is the container; `HighlightedText` is presentational.

2. **Character Offset Coordinates**: Store annotation positions as character offsets relative to the original text, not as DOM positions. This ensures highlights survive re-renders, zoom, and resize.

3. **Composition over Monolith**: Build small, reusable components (`HighlightMark`, `CopyButton`, `ClauseCard`) rather than one massive component.

### 8.2 The Highlighting Challenge

The core technical challenge: rendering a single text string with multiple non-overlapping colored `<mark>` elements.

**Recommended Algorithm** (from research):
```
1. Get list of clauses with valid (start, end) offsets
2. Sort by start_offset ascending
3. Remove overlapping regions (keep first match)
4. Walk through text, splitting into segments:
   - Plain text spans (between highlights)
   - <mark> elements (for each clause)
5. Each <mark> gets:
   - CSS class for color (danger/warning/safe)
   - Active state styling if selected
   - onClick handler for bidirectional linking
   - Unique id for scroll-into-view targeting
```

### 8.3 Performance Considerations

- **Memoize** the segment array with `useMemo` — only recompute when `contractText`, `clauses`, or `activeClauseId` changes
- For large documents (>10k words), consider **virtualization** or **pagination**
- Use `React.memo` on `ClauseCard` components to prevent re-renders when only the active card changes

### 8.4 Accessibility

- All highlighted regions should be keyboard-navigable
- `<mark>` elements should have `role="button"` and `aria-label` for screen readers
- Clause cards should be reachable via Tab navigation

---

## 9. Frontend Architecture Patterns

### 9.1 Feature-Based Project Structure

Research strongly recommends organizing by feature rather than by file type:

```
src/
├── components/        # Shared UI primitives (Button, Modal, etc.)
├── features/          # Feature modules with co-located files
│   ├── contract/      # Everything for the left panel
│   └── dashboard/     # Everything for the right panel
├── hooks/             # Global shared hooks
├── services/          # API client
├── context/           # React Context providers
└── types/             # Shared TypeScript interfaces
```

### 9.2 State Management

For an app with:
- Single page (no routing)
- Two tightly-coupled panels
- ~15 state variables
- No server-side persistence

**React Context + useReducer** is the right choice. Zustand/Redux are overkill.

### 9.3 TypeScript Strict Mode

Use `"strict": true` and path aliases:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

This keeps imports clean (`@/types` vs `../../../../types`) and catches type errors early.

---

## 10. Consolidated Takeaways

These are the concrete design decisions derived from all research above. Each feeds directly into the Architecture Document.

### 10.1 What We MUST Do (Non-Negotiable)

| # | Takeaway | Source | Impact |
|:--|:--|:--|:--|
| T1 | Every AI finding must trace back to EXACT verbatim text from the contract | LegalOn, LangExtract, grounded extraction pattern | Enables text highlighting; builds user trust |
| T2 | Schema-enforce all LLM outputs via Pydantic + `response_schema` | Gemini best practices, LLM architecture research | Prevents malformed JSON crashes |
| T3 | App must work fully without a Gemini API key | DoNotPay's instant-value model | Heuristic fallback is a first-class feature, not degraded |
| T4 | Use weighted category-based risk scoring (not just counting flags) | Legal industry risk scoring methodology | Produces meaningful, explainable scores |
| T5 | Layered backend architecture (routes → services → analyzers) | FastAPI production patterns | Clean separation of concerns; testable |
| T6 | Global exception handlers, never try/except in routes | FastAPI best practices | Consistent error responses; no stack trace leaks |
| T7 | Exponential backoff + jitter for Gemini retries | Gemini API error handling research | Handles rate limits gracefully |
| T8 | Character-offset-based highlighting (computed server-side) | React annotation patterns | Reliable highlighting that survives re-renders |
| T9 | Clear "not legal advice" disclaimer | DoNotPay regulatory scrutiny | Legal compliance |
| T10 | Transparency: show which engine produced results (Gemini vs Heuristic) | Human-in-the-loop principle | User trust and expectation management |

### 10.2 What We SHOULD Do (Best Practice)

| # | Takeaway | Source |
|:--|:--|:--|
| S1 | Persona-based system prompt ("Senior Legal Counsel") | Gemini prompt engineering |
| S2 | Chain-of-thought within single prompt for better accuracy | LLM integration best practices |
| S3 | Memoize expensive React renders (highlighted text, clause cards) | React performance patterns |
| S4 | Feature-based project structure on frontend | Vite/React scalability patterns |
| S5 | Pre-computed sample analyses as "gold standard" demos | Competitive analysis (Justee) |
| S6 | Provide copy-pasteable fair counterclauses | Gap analysis (no competitor does this well) |

### 10.3 What We Should AVOID

| # | Anti-Pattern | Why |
|:--|:--|:--|
| A1 | Single-agent "chat with document" loop | Unreliable for structured extraction |
| A2 | Raw text regex on LLM output instead of schema enforcement | Brittle; breaks on formatting changes |
| A3 | Retry on 400/403 errors | Wastes time; these are client-side issues that won't resolve with retry |
| A4 | Middleware for business logic exceptions | Makes debugging request flow difficult |
| A5 | Prop drilling through 5+ component levels | Use Context instead |
| A6 | Building one monolithic component for the viewer | Unmaintainable; use composition |

---

> **Next Document**: [02 — Architecture Document](file:///C:/Users/augus/.gemini/antigravity-ide/brain/675a5651-1143-4e08-b635-49fbde3f9d28/02_architecture.md) — Where we translate these findings into concrete system design decisions.
