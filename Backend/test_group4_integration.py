import asyncio
import time
from api.schemas import AnalyzeRequest
from services.analyzer import analysis_service
from data.sample_contracts import list_samples, get_sample_by_id
from models.exceptions import (
    EmptyContractError,
    ContractTooShortError,
    ContractTooLongError,
)

async def run_group4_audit_suite():
    print("==================================================")
    print("  CLAUSELENS GROUP 4 INTEGRATION & UNIDEAL AUDIT  ")
    print("==================================================")

    # 1. Test Health & Sample Contracts
    samples = list_samples()
    print(f"[OK] Loaded {len(samples)} curated sample contracts.")
    for s in samples:
        print(f"    - Sample ID: {s['id']} | Category: {s['category']} | Title: {s['title']}")

    sample_contract = get_sample_by_id("freelance_dev")
    text = sample_contract["text"]

    # 2. Test Full Pipeline Analysis with Heuristic Engine
    start_t = time.monotonic()
    req = AnalyzeRequest(contract_text=text)
    res = await analysis_service.analyze_contract(req)
    dur = int((time.monotonic() - start_t) * 1000)

    print(f"\n[OK] Full Contract Analysis Succeeded in {dur}ms:")
    print(f"    - Engine: {res.analysis_engine}")
    print(f"    - Score: {res.overall_score}/100")
    print(f"    - Summary: {res.summary[:80]}...")
    print(f"    - Flagged Clauses: {len(res.clauses)}")

    for idx, c in enumerate(res.clauses, 1):
        print(f"      {idx}. [{c.type.upper()}] [{c.start_offset}:{c.end_offset}] - {c.title}")
        assert c.start_offset >= -1 and c.end_offset >= -1
        assert c.text and c.explanation and c.counterclause

    # 3. Test Unideal Conditions from 04_unideal_testing_matrix.md
    print("\n--- Running Unideal Condition Resilience Audits ---")

    # UT-01: Empty Contract Text
    try:
        await analysis_service.analyze_contract(AnalyzeRequest(contract_text="   "))
        assert False, "UT-01 Failed: Empty contract did not raise error"
    except EmptyContractError:
        print("[OK] UT-01 Empty contract text validation: PASSED")

    # UT-02: Contract Too Short
    try:
        await analysis_service.analyze_contract(AnalyzeRequest(contract_text="Too short text."))
        assert False, "UT-02 Failed: Short contract did not raise error"
    except ContractTooShortError:
        print("[OK] UT-02 Contract too short validation: PASSED")

    # UT-03: Contract Exceeds Maximum Length
    try:
        huge_text = "A" * 105000
        await analysis_service.analyze_contract(AnalyzeRequest(contract_text=huge_text))
        assert False, "UT-03 Failed: Oversized contract did not raise error"
    except ContractTooLongError:
        print("[OK] UT-03 Contract too long validation: PASSED")

    # UT-04: Invalid Gemini API Key Fallback
    bad_key_req = AnalyzeRequest(contract_text=text, api_key="AIzaSy_fake_invalid_key_xyz")
    fallback_res = await analysis_service.analyze_contract(bad_key_req)
    assert fallback_res.analysis_engine == "heuristic"
    assert fallback_res.overall_score >= 0 and fallback_res.overall_score <= 100
    print("[OK] UT-04 Invalid API key graceful fallback to Heuristic: PASSED")

    # UT-12: Zero Red Flag Clean Contract
    clean_text = "Standard commercial receipt. Product delivered in good order. Payment received in full. Thank you for your business." * 2
    clean_res = await analysis_service.analyze_contract(AnalyzeRequest(contract_text=clean_text))
    assert clean_res.overall_score == 100
    print("[OK] UT-12 Zero red flag contract score 100: PASSED")

    print("\n==================================================")
    print("  ALL GROUP 4 SYSTEM INTEGRATION TESTS PASSED!   ")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_group4_audit_suite())
