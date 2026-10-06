import re
import logging
from typing import List, Optional, Dict, Any
from analyzers.base import BaseAnalyzer
from models.clause import Clause, AnalysisResult, RiskType
from data.sample_contracts import SAMPLE_CONTRACTS

logger = logging.getLogger("clauselens.heuristic_analyzer")

# Regex pattern library for contract red flags organized by risk category
PATTERN_LIBRARY: List[Dict[str, Any]] = [
    {
        "category": "Liability & Indemnification",
        "patterns": [
            r"indemnify\s+and\s+hold\s+harmless",
            r"defend,?\s+indemnify",
            r"unlimited\s+liability",
            r"regardless\s+of\s+fault",
            r"sole\s+liability",
            r"shall\s+not\s+be\s+liable\s+for\s+any\s+damages"
        ],
        "default_type": RiskType.DANGER,
        "default_title": "Broad Indemnification & One-Sided Liability",
        "default_explanation": "This clause forces you to absorb legal fees and financial claims, potentially even when the other party is at fault.",
        "default_counterclause": "Each party shall indemnify and hold harmless the other party solely from third-party claims arising from its own gross negligence or willful misconduct. Neither party's aggregate liability shall exceed total fees paid."
    },
    {
        "category": "Intellectual Property & Data",
        "patterns": [
            r"perpetual,?\s+irrevocable.*license",
            r"unconditionally\s+assigns?.*all\s+prior",
            r"train\s+(?:AI|machine\s+learning)",
            r"monetize.*data",
            r"waives?\s+all\s+moral\s+rights"
        ],
        "default_type": RiskType.DANGER,
        "default_title": "Overbroad Intellectual Property & Data Seizure",
        "default_explanation": "Claims sweeping ownership or perpetual rights over your data, work product, or pre-existing tools without fair compensation.",
        "default_counterclause": "Developer assigns to Client all IP created specifically for deliverables under this Agreement upon full payment. Developer retains all rights to pre-existing code, tools, and background IP."
    },
    {
        "category": "Payment & Financial Terms",
        "patterns": [
            r"sole\s+discretion.*withhold",
            r"within\s+(?:ninety|90|120)\s+days",
            r"non-refundable.*fee",
            r"increase.*without\s+(?:prior\s+)?notice",
            r"retain.*entire\s+security\s+deposit"
        ],
        "default_type": RiskType.DANGER,
        "default_title": "Unfavorable Payment & Unilateral Withholding",
        "default_explanation": "Imposes delayed payment cycles, non-refundable deposit forfeitures, or unilateral rights to withhold payment for completed work.",
        "default_counterclause": "Payment shall be due within thirty (30) days of invoice date. Disputed amounts must be notified in writing within 10 days, while undisputed portions remain payable on time."
    },
    {
        "category": "Termination & Exit",
        "patterns": [
            r"terminate.*immediately.*without\s+cause",
            r"without\s+payment\s+for\s+work",
            r"refund\s+all\s+payments",
            r"owe.*remaining\s+balance.*rent"
        ],
        "default_type": RiskType.DANGER,
        "default_title": "Asymmetric Termination & Accelerated Penalty",
        "default_explanation": "Allows the other party to terminate instantly without paying for completed work, while imposing heavy exit penalties on you.",
        "default_counterclause": "Either party may terminate this agreement upon fourteen (14) days written notice. Upon termination, Client shall pay for all work completed up to the effective termination date."
    },
    {
        "category": "Restrictive Covenants",
        "patterns": [
            r"not\s+(?:perform|engage|compete).*(?:3|three|5|five)\s+years",
            r"worldwide.*non-compete",
            r"technology\s+sector\s+worldwide"
        ],
        "default_type": RiskType.DANGER,
        "default_title": "Overbroad Restrictive Non-Compete",
        "default_explanation": "Restricts your ability to work or conduct business across an unreasonably broad geographic or industry scope for an extended period.",
        "default_counterclause": "For twelve (12) months following termination, Contractor agrees not to directly solicit Client's active customers for identical services specified herein."
    },
    {
        "category": "Privacy, Access & Compliance",
        "patterns": [
            r"enter.*at\s+any\s+time.*without\s+(?:prior\s+)?notice",
            r"day\s+or\s+night",
            r"governed\s+by.*client's\s+jurisdiction",
            r"binding.*arbitration.*waive.*class\s+action"
        ],
        "default_type": RiskType.WARNING,
        "default_title": "Unannounced Access & Dispute Restrictions",
        "default_explanation": "Waives advance notice rights or restricts legal remedies via mandatory arbitration in distant jurisdictions.",
        "default_counterclause": "Landlord/Party shall provide at least twenty-four (24) hours advance written notice prior to entering premises during reasonable business hours, except in emergency cases."
    }
]

CATEGORY_WEIGHTS: Dict[str, float] = {
    "Liability & Indemnification": 0.25,
    "Intellectual Property & Data": 0.20,
    "Payment & Financial Terms": 0.20,
    "Termination & Exit": 0.15,
    "Restrictive Covenants": 0.10,
    "Privacy, Access & Compliance": 0.10,
}

class HeuristicAnalyzer(BaseAnalyzer):
    """
    Pattern-based offline analysis engine.
    
    1. Checks if contract matches a curated sample contract.
    2. Scans contract text line-by-line using regex pattern library.
    3. Calculates deterministic fairness score (0-100).
    """

    async def analyze(
        self,
        contract_text: str,
        contract_type: Optional[str] = None
    ) -> AnalysisResult:
        """Execute heuristic contract analysis."""
        logger.info("Executing HeuristicAnalyzer scanner...")

        # 1. Check for sample contract match
        sample_result = self._check_sample_match(contract_text)
        if sample_result:
            logger.info("Matched curated sample contract! Returning expert pre-computed analysis.")
            return sample_result

        # 2. Pattern scanning
        flagged_clauses: List[Clause] = []
        clause_counter = 1

        # Split text into paragraphs/sentences for extraction
        paragraphs = [p.strip() for p in contract_text.split("\n\n") if p.strip()]
        if not paragraphs:
            paragraphs = [contract_text]

        for para in paragraphs:
            for rule in PATTERN_LIBRARY:
                for pattern in rule["patterns"]:
                    match = re.search(pattern, para, re.IGNORECASE)
                    if match:
                        clause_id = f"clause-{clause_counter}"
                        clause_counter += 1
                        
                        flagged_clauses.append(
                            Clause(
                                id=clause_id,
                                text=para,  # Exact paragraph substring
                                type=rule["default_type"],
                                category=rule["category"],
                                title=rule["default_title"],
                                explanation=rule["default_explanation"],
                                counterclause=rule["default_counterclause"],
                                start_offset=-1,
                                end_offset=-1
                            )
                        )
                        break  # Avoid duplicate flags for same paragraph under same rule

        # 3. Calculate score & risk counts
        score, risk_counts, category_scores = self._calculate_scores(flagged_clauses)
        summary = self._generate_summary(flagged_clauses, score)
        key_takeaways = self._generate_takeaways(flagged_clauses)

        return AnalysisResult(
            overall_score=score,
            summary=summary,
            risk_counts=risk_counts,
            category_scores=category_scores,
            key_takeaways=key_takeaways,
            clauses=flagged_clauses,
            analysis_engine="heuristic"
        )

    def _check_sample_match(self, contract_text: str) -> Optional[AnalysisResult]:
        """Fuzzy match input contract text against curated samples."""
        clean_input = " ".join(contract_text.split()[:40]).lower()
        for sample in SAMPLE_CONTRACTS:
            clean_sample = " ".join(sample["text"].split()[:40]).lower()
            if clean_input == clean_sample or sample["text"] in contract_text or contract_text in sample["text"]:
                return sample["sample_analysis"]
        return None

    def _calculate_scores(self, clauses: List[Clause]) -> tuple[int, Dict[str, int], Dict[str, int]]:
        """Calculate overall score out of 100, risk counts, and per-category scores."""
        risk_counts = {"danger": 0, "warning": 0, "safe": 0}
        category_penalties: Dict[str, float] = {cat: 0.0 for cat in CATEGORY_WEIGHTS}

        for clause in clauses:
            risk_counts[clause.type.value] += 1
            penalty = 15.0 if clause.type == RiskType.DANGER else (7.0 if clause.type == RiskType.WARNING else 0.0)
            if clause.category in category_penalties:
                category_penalties[clause.category] += penalty

        total_penalty = 0.0
        category_scores: Dict[str, int] = {}
        for cat, weight in CATEGORY_WEIGHTS.items():
            cat_penalty = category_penalties[cat]
            cat_score = max(0, min(100, round(100 - (cat_penalty * 3))))
            category_scores[cat] = cat_score
            total_penalty += cat_penalty * weight

        overall_score = max(0, min(100, round(100 - (total_penalty * 2.5))))
        return overall_score, risk_counts, category_scores

    def _generate_summary(self, clauses: List[Clause], score: int) -> str:
        """Generate executive summary text based on score and flagged clauses."""
        if not clauses:
            return "No prominent red flags or predatory clauses were detected in this contract text. Review standard commercial terms prior to signing."
        
        danger_count = sum(1 for c in clauses if c.type == RiskType.DANGER)
        if score < 45:
            return f"This contract presents significant risk with {danger_count} dangerous or predatory terms identified. It contains high financial exposure and asymmetric obligations. Negotiation is strongly advised."
        elif score < 75:
            return f"This contract contains moderate risk factors including {len(clauses)} flagged clauses that require clarification or negotiation before executing."
        else:
            return "This contract appears relatively standard and balanced, with minor areas highlighted for your awareness."

    def _generate_takeaways(self, clauses: List[Clause]) -> List[str]:
        """Generate top key takeaways from flagged clauses."""
        takeaways = []
        dangers = [c for c in clauses if c.type == RiskType.DANGER]
        warnings = [c for c in clauses if c.type == RiskType.WARNING]

        for c in dangers[:3]:
            takeaways.append(f"HIGH RISK: {c.title} — {c.explanation}")
        for c in warnings[:2]:
            takeaways.append(f"WARNING: {c.title} — {c.explanation}")

        if not takeaways:
            takeaways.append("Standard contract terms detected; no severe red flags found.")

        return takeaways
