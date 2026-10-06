# 🧪 ClauseLens — Unideal Testing & Verification Matrix

> **Document Purpose**: Exhaustive audit specification detailing every failure mode, edge case, malformed input, network interruption, and LLM anomaly — paired with the exact fallback mechanism and verification procedure to guarantee resilient performance under non-ideal conditions.
>
> **Prerequisites**: Read [02 — Architecture](file:///C:/Users/augus/.gemini/antigravity-ide/brain/675a5651-1143-4e08-b635-49fbde3f9d28/02_architecture.md) and [03 — Implementation Plan](file:///C:/Users/augus/.gemini/antigravity-ide/brain/675a5651-1143-4e08-b635-49fbde3f9d28/03_implementation_plan.md).
>
> **Last Updated**: 2026-10-05

---

## 1. Overview & Resilience Guarantees

ClauseLens adheres to 5 Non-Negotiable Resilience Guarantees:
1. **Never Crash**: No exception or unhandled error will ever crash the application backend or freeze the frontend UI.
2. **Transparent Fallback**: If an upstream service (like Gemini API) fails, ClauseLens silently falls back to internal engines (Heuristic pattern scanner) while informing the user via `analysis_engine="heuristic"`.
3. **Graceful Degraded Highlighting**: If LLM output text cannot be matched to character offsets in the source text, the clause card remains fully readable in the dashboard without breaking text rendering in the left panel.
4. **Input Boundary Protection**: Malformed, empty, or excessively long contract inputs are caught at the validation layer with clear, helpful error messages before wasting AI API tokens.
5. **Offline Reliability**: Curated sample contracts and heuristic fallback require zero internet connectivity or API keys to provide instant expert-level contract audits.

---

## 2. Comprehensive Test & Audit Matrix

| Test ID | Category | Scenario / Unideal Condition | Expected System Behavior & Fallback | Automated / Empirical Verification Method |
|:---|:---|:---|:---|:---|
| **UT-01** | Backend Input | Empty contract text (`""` or whitespace only) | API returns HTTP 400 with `error_code: "EMPTY_CONTRACT"`. Backend raises `EmptyContractError`. | `curl -X POST /api/analyze -d '{"contract_text": "   "}'` → Check HTTP 400 |
| **UT-02** | Backend Input | Contract text < 50 characters (e.g. `"Short text."`) | API returns HTTP 400 with `error_code: "CONTRACT_TOO_SHORT"`. | `curl -X POST /api/analyze -d '{"contract_text": "Hello"}'` → Check HTTP 400 |
| **UT-03** | Backend Input | Contract text > 100,000 characters | API returns HTTP 413 with `error_code: "CONTRACT_TOO_LONG"`. | Send 105k character string payload → Check HTTP 413 |
| **UT-04** | Gemini API | Invalid API Key (`"AIzaSy_invalid_key_xyz"`) | `GeminiAnalyzer` catches HTTP 400/401, raises `GeminiAPIError(auth_failed=True)`. `AnalysisService` logs warning and falls back to `HeuristicAnalyzer`. Response HTTP 200 OK with `analysis_engine: "heuristic"`. | Pass invalid key in request → Verify response contains valid analysis and `analysis_engine == "heuristic"` |
| **UT-05** | Gemini API | Rate Limit Exceeded (HTTP 429) | `tenacity` retries 3 times with exponential backoff (1s, 2s, 4s). On 4th failure, raises `GeminiAPIError(rate_limited=True)` → falls back to `HeuristicAnalyzer`. | Mock 429 response on Gemini API endpoint → Verify 3 retry attempts in logs and successful heuristic fallback |
| **UT-06** | Gemini API | API Timeout (> 25 seconds) | `asyncio.timeout(25)` triggers. Raises `GeminiAPIError(timeout=True)` → falls back to `HeuristicAnalyzer`. | Inject 30s delay in mock Gemini client → Verify fallback completes under 26s total |
| **UT-07** | Gemini API | Safety Filter Block (`finish_reason == SAFETY`) | Detects safety block in Gemini response candidates. Raises `GeminiAPIError(safety_blocked=True)` → falls back to `HeuristicAnalyzer`. | Inject safety block candidate response → Verify heuristic fallback and clean 200 OK |
| **UT-08** | Gemini API | Malformed / Truncated JSON Output from LLM | `json.loads` or `Pydantic` validation fails. Catches `ResponseParseError` → falls back to `HeuristicAnalyzer`. | Mock Gemini returning `{"overall_score": "incomplete...` → Verify fallback to heuristic |
| **UT-09** | Text Offset | LLM text snippet has normalized whitespace mismatches (e.g. smart quotes `“` or extra newlines) | `OffsetService` Level 1 (exact string match) fails → Level 2 (normalized whitespace match) succeeds and maps correct start/end offsets. | Pass clause snippet with single space where original has double space → Check valid non-negative offsets returned |
| **UT-10** | Text Offset | LLM text snippet paraphrased or completely altered by AI | `OffsetService` Level 1, 2, 3 fail → returns offsets `(-1, -1)`. Backend does not raise error. Frontend renders card in dashboard without highlight in left panel. | Inject non-existent clause text into result → Verify `start_offset: -1`, `end_offset: -1` and UI renders without error |
| **UT-11** | Text Offset | Two flagged clauses overlap in character ranges `[50, 120]` and `[100, 160]` | `OffsetService` overlap resolution detects overlap, keeps first clause, resets second clause offsets to `(-1, -1)`. Prevents broken `<mark>` nesting in DOM. | Input overlapping clause ranges to `enrich_offsets()` → Verify second clause offset reset to `(-1, -1)` |
| **UT-12** | Heuristic | Contract contains zero red flag keywords | `HeuristicAnalyzer` returns clean `AnalysisResult` with score 100, empty clauses list, summary stating no obvious red flags found. No mathematical division by zero. | Analyze standard receipt text → Verify score 100 and clean response |
| **UT-13** | Heuristic | Contract contains 25 high-risk clauses (calculated score would be -350) | Score calculation algorithm clamps output score to range `[0, 100]`. Score returns as `0`. | Analyze text with 25 predatory clauses → Verify score is exactly `0` |
| **UT-14** | Both Analyzers | Total System Failure (Gemini AND Heuristic fail due to mock error) | `AnalysisService` catches exception, executes `_minimal_result()` fallback. Returns valid score 50 `AnalysisResult` with `analysis_engine: "minimal"`. API status 200 OK. | Mock exception in both analyzers → Verify response 200 OK with `analysis_engine == "minimal"` |
| **UT-15** | Frontend Network | Backend server offline or unreachable (connection refused) | `api.ts` catches fetch failure, throws `ApiError(0, "NETWORK_ERROR", ...)`. Frontend displays `ErrorBanner` stating backend server unavailable. | Stop backend server and click "Audit" in UI → Verify `ErrorBanner` displays network error message |
| **UT-16** | Frontend API Key | User inputs key with accidental leading/trailing spaces (`"  AIzaSy...  "`) | `ApiKeyModal` trims string before saving to `localStorage` and dispatching to state. | Type key with spaces in modal → Inspect `localStorage` and verify trimmed string |
| **UT-17** | Frontend UI | User edits contract text after analysis was run | `ContractViewer` detects text hash mismatch, displays warning banner: "Contract text modified. Highlights may be out of sync. Re-analyze to update highlights." | Type new characters into contract textarea → Verify warning banner appears above text |
| **UT-18** | Frontend Clipboard | Browser Clipboard API restricted (HTTP or iframe environment) | `CopyButton` catches Clipboard API rejection, falls back to standard text selection prompt or manual copy feedback. | Restrict `navigator.clipboard.writeText` in console → Click Copy → Verify graceful fallback feedback |
| **UT-19** | Frontend Search | Dashboard filter search term returns 0 clause cards | `Dashboard` renders clean empty state component: "No flagged clauses match your filter criteria." | Type `"xyz123unmatched"` in search bar → Verify empty state illustration |

---

## 3. Verification Execution Protocol

When conducting verification for any component or phase:
1. First execute the **Standard Verification** to confirm normal happy-path function.
2. Immediately execute the corresponding **Unideal Condition Verification** specified in the matrix above.
3. Confirm that the application handled the unideal condition gracefully according to the expected system behavior column.
4. Record results and verify zero unhandled console warnings or backend traceback logs.
