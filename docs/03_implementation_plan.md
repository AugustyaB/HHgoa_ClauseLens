# 📋 ClauseLens — Master Phased Implementation Roadmap

> **Document Purpose**: Categorized master implementation roadmap for ClauseLens, structured into four clear milestone groups: Setup & Planning, Backend Development, Frontend Development, and Final Testing & Analysis.
>
> **Prerequisites**: Read [01 — Research & Analysis](file:///C:/Users/augus/.gemini/antigravity-ide/brain/675a5651-1143-4e08-b635-49fbde3f9d28/01_research_and_analysis.md) and [02 — Architecture](file:///C:/Users/augus/.gemini/antigravity-ide/brain/675a5651-1143-4e08-b635-49fbde3f9d28/02_architecture.md).
>
> **Last Updated**: 2026-10-06

---

## 🗺️ Master Category Overview

| Milestone Group | Phase Range | Focus Area | Status |
|:---|:---|:---|:---|
| **GROUP 1: Setup, Planning & Architecture** | **Phases 1 – 2** | Competitive research, domain modeling, system architecture & unideal test matrix | **COMPLETED** |
| **GROUP 2: Backend Development** | **Phases 3 – 5** | FastAPI core, models, offset service, heuristic scanner, Gemini integration & fallback orchestrator | **COMPLETED** |
| **GROUP 3: Frontend Development** | **Phases 6 – 8** | Vite + React + TS setup, Tailwind dark design system, highlight engine, two-panel layout & dashboard | **COMPLETED** |
| **GROUP 4: Testing, System Analysis & Polish** | **Phases 9 – 10** | E2E integration, markdown exporter, systematic unideal condition auditing & design polish | **COMPLETED** |

---

## GROUP 1: Setup, Planning & Architecture (Phases 1 – 2) [COMPLETED]

### Phase 1: Research, Domain Analysis & Competitive Audit [COMPLETED]
- [x] **Task 1.1**: Conduct legal tech market audit (LegalOn, Justee, DoNotPay, Luminance, Spellbook).
- [x] **Task 1.2**: Define ClauseLens 6 risk taxonomy (Liability, IP, Payment, Termination, Restrictive, Privacy).
- [x] **Task 1.3**: Document 10 key takeaways & gap analysis in [01_research_and_analysis.md](file:///C:/Users/augus/.gemini/antigravity-ide/brain/675a5651-1143-4e08-b635-49fbde3f9d28/01_research_and_analysis.md).

### Phase 2: System Architecture & Unideal Testing Matrix [COMPLETED]
- [x] **Task 2.1**: Define layered system architecture, Pydantic domain models, and FastAPI router structure.
- [x] **Task 2.2**: Design fail-safe analysis service orchestrator with automatic heuristic fallback.
- [x] **Task 2.3**: Design multi-level character offset algorithm (`OffsetService`) for substring tracing.
- [x] **Task 2.4**: Create complete System Architecture Document in [02_architecture.md](file:///C:/Users/augus/.gemini/antigravity-ide/brain/675a5651-1143-4e08-b635-49fbde3f9d28/02_architecture.md).
- [x] **Task 2.5**: Create Unideal Testing & Verification Matrix in [04_unideal_testing_matrix.md](file:///C:/Users/augus/.gemini/antigravity-ide/brain/675a5651-1143-4e08-b635-49fbde3f9d28/04_unideal_testing_matrix.md).

---

## GROUP 2: Backend Development (Phases 3 – 5) [COMPLETED]

### Phase 3: Backend Foundation, Domain Models & Offset Service [COMPLETED]
- [x] **Task 3.1**: Initialize `Backend/` project (`requirements.txt`, `config.py` with `pydantic-settings`).
- [x] **Task 3.2**: Create domain models (`Clause`, `AnalysisResult`, `RiskType`) & custom exception hierarchy.
- [x] **Task 3.3**: Create static sample data store (`Backend/data/sample_contracts.py`) with 3 expert-curated contracts.
- [x] **Task 3.4**: Build Character Offset Engine (`Backend/services/offset_service.py`).
- [x] **Task 3.5**: Implement API schemas & global error handlers (`api/schemas.py`, `api/error_handlers.py`).
- [x] **Task 3.6**: Assemble FastAPI `main.py` with CORS middleware.

### Phase 4: Heuristic Analysis Engine & Pattern Scanner [COMPLETED]
- [x] **Task 4.1**: Create `BaseAnalyzer` interface and regex pattern scanner (`Backend/analyzers/heuristic_analyzer.py`).
- [x] **Task 4.2**: Implement weighted risk scoring algorithm & category breakdown.

### Phase 5: Gemini AI Integration & Fail-Safe Service Orchestrator [COMPLETED]
- [x] **Task 5.1**: Build `GeminiAnalyzer` (`Backend/analyzers/gemini_analyzer.py`, `prompts.py`) using `google-genai` SDK and Pydantic `response_schema`.
- [x] **Task 5.2**: Build fail-safe `AnalysisService` orchestrator (`Backend/services/analyzer.py`).

---

## GROUP 3: Frontend Development (Phases 6 – 8) [COMPLETED]

### Phase 6: Frontend Foundation, Design System & React Context State Engine [COMPLETED]
- [x] **Task 6.1**: Initialize Vite + React + TypeScript in `Frontend/`, configure Tailwind CSS & dark theme tokens.
- [x] **Task 6.2**: Build TypeScript domain interfaces (`Frontend/src/types/index.ts`) matching backend models.
- [x] **Task 6.3**: Implement HTTP API Client (`Frontend/src/services/api.ts`) with 35s timeout & `ApiError` handling.
- [x] **Task 6.4**: Build `AnalysisContext` using `useReducer` to manage contract text, results, view modes, and API key.

### Phase 7: Left Panel — Contract Viewer & Substring Highlighting Engine [COMPLETED]
- [x] **Task 7.1**: Build `HighlightedText.tsx` `<mark>` engine for offset-based text rendering.
- [x] **Task 7.2**: Build `ContractEditor.tsx`, `ContractToolbar.tsx`, and `ContractViewer.tsx`.

### Phase 8: Right Panel — Interactive Fairness Dashboard & Action Bar [COMPLETED]
- [x] **Task 8.1**: Build `FairnessGauge.tsx` (SVG radial meter) & `RiskSummary.tsx`.
- [x] **Task 8.2**: Build expandable `ClauseCard.tsx` with Copy button & One-Click **Replace in Contract** action.
- [x] **Task 8.3**: Build `CategoryBreakdown.tsx`, `ClauseFilterBar.tsx`, and assemble full `Dashboard.tsx`.

---

## GROUP 4: Testing, System Analysis & Polish (Phases 9 – 10) [COMPLETED]

### Phase 9: End-to-End System Integration & Markdown Exporter [COMPLETED]
- [x] **Task 9.1**: Connect Frontend & Backend via Vite API proxy (`http://localhost:8000`).
- [x] **Task 9.2**: Implement `export.ts` for downloading full markdown audit reports (`ClauseLens_Audit_Report_[Date].md`).
- [x] **Task 9.3**: Add `ApiKeyModal.tsx`, `ErrorBanner.tsx`, and `LoadingOverlay.tsx`.

### Phase 10: Systematic Unideal Condition Verification, UX Audit & Optimization [COMPLETED]
- [x] **Task 10.1**: Execute full 19-point audit from [04_unideal_testing_matrix.md](file:///C:/Users/augus/.gemini/antigravity-ide/brain/675a5651-1143-4e08-b635-49fbde3f9d28/04_unideal_testing_matrix.md) via `test_group4_integration.py`.
- [x] **Task 10.2**: Refine design language system to Legal Midnight Navy (`#0b1329`) and Sapphire Blue accents, replacing all purple/indigo colors.
- [x] **Task 10.3**: Remove all raw text emojis, replacing them strictly with Lucide SVG vectors (`ShieldCheck`, `AlertCircle`, `AlertOctagon`, `AlertTriangle`, `CheckCircle2`, `Check`, `Sparkles`, `Download`, `Key`, `Quote`).
- [x] **Task 10.4**: Verify zero console errors, zero unhandled tracebacks, and clean 100% production build (`npm run build`).
