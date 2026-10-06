from typing import Dict, List, Any
from models.clause import Clause, AnalysisResult, RiskType
from models.exceptions import SampleNotFoundError

SAMPLE_CONTRACTS: List[Dict[str, Any]] = [
    {
        "id": "freelance_dev",
        "title": "Freelance Software Development Agreement",
        "category": "Freelance & Consulting",
        "description": "A software development agreement containing predatory indemnification, perpetual IP assignment, and uncompensated delay clauses.",
        "text": """FREELANCE SOFTWARE DEVELOPMENT AGREEMENT

This Agreement is entered into by and between Client Inc. ("Client") and Contractor ("Developer").

1. SCOPE OF SERVICES
Developer agrees to perform software engineering and design services as specified in Statement of Work #1.

2. INDEMNIFICATION & LIABILITY
Developer shall defend, indemnify, and hold harmless Client, its officers, and affiliates from any and all claims, damages, liabilities, costs, and expenses (including attorneys' fees) arising out of or related to any breach of this Agreement or any fault, negligence, or error in deliverables, regardless of whether Client contributed to such fault. Developer's liability under this section shall be unlimited.

3. INTELLECTUAL PROPERTY RIGHTS
Developer hereby unconditionally assigns to Client all right, title, and interest in all code, documentation, designs, and inventions created under this Agreement, as well as all prior inventions created by Developer at any time. Developer grants Client an irrevocable right to use Developer's name, likeness, and confidential pre-existing tools for AI training and commercial monetization without compensation.

4. PAYMENT TERMS
Client shall pay Developer within ninety (90) days of invoice approval. Client reserves the right to withhold payment at its sole discretion if Client deems any deliverable unsatisfactory or if project timelines slip for any reason.

5. TERMINATION
Client may terminate this Agreement immediately at any time without cause and without payment for work in progress. Developer may only terminate upon sixty (60) days written notice and must refund all payments received to date.

6. RESTRICTIVE COVENANTS
For a period of three (3) years following termination, Developer agrees not to perform software services for any entity in the technology sector worldwide.

7. GOVERNING LAW
This Agreement shall be governed by the laws of Client's jurisdiction.""",
        "sample_analysis": AnalysisResult(
            overall_score=34,
            summary="This agreement is severely predatory toward the Developer. It imposes unlimited indemnification regardless of fault, perpetual IP seizure including pre-existing tools, 90-day delayed payment with unilateral withholding, instant client termination without pay, and a 3-year global non-compete.",
            risk_counts={"danger": 5, "warning": 1, "safe": 1},
            category_scores={
                "Liability & Indemnification": 15,
                "Intellectual Property & Data": 25,
                "Payment & Financial Terms": 30,
                "Termination & Exit": 20,
                "Restrictive Covenants": 20,
                "Privacy, Access & Compliance": 80,
            },
            key_takeaways=[
                "CRITICAL RISK: Developer bears unlimited liability and indemnifies Client even when Client is at fault.",
                "HIGH RISK: Client seizes prior inventions and pre-existing tools for AI training without royalty.",
                "HIGH RISK: 90-day payment terms with unilateral right to withhold payment at Client's sole discretion.",
                "HIGH RISK: 3-year global non-compete severely restricts Developer's livelihood."
            ],
            clauses=[
                Clause(
                    id="clause-1",
                    text="Developer shall defend, indemnify, and hold harmless Client, its officers, and affiliates from any and all claims, damages, liabilities, costs, and expenses (including attorneys' fees) arising out of or related to any breach of this Agreement or any fault, negligence, or error in deliverables, regardless of whether Client contributed to such fault. Developer's liability under this section shall be unlimited.",
                    type=RiskType.DANGER,
                    category="Liability & Indemnification",
                    title="Unlimited One-Sided Indemnification",
                    explanation="Forces you to pay all legal fees and damages even if the client contributed to the mistake. Your financial exposure is unlimited.",
                    counterclause="Each party shall indemnify and hold harmless the other party from third-party claims arising solely from its gross negligence or willful misconduct. Neither party's total aggregate liability shall exceed the fees paid under this Agreement.",
                    start_offset=275,
                    end_offset=742
                ),
                Clause(
                    id="clause-2",
                    text="Developer hereby unconditionally assigns to Client all right, title, and interest in all code, documentation, designs, and inventions created under this Agreement, as well as all prior inventions created by Developer at any time. Developer grants Client an irrevocable right to use Developer's name, likeness, and confidential pre-existing tools for AI training and commercial monetization without compensation.",
                    type=RiskType.DANGER,
                    category="Intellectual Property & Data",
                    title="Seizure of Prior IP & Uncompensated AI Exploitation",
                    explanation="Claims ownership of inventions you built prior to this contract and allows them to train AI on your confidential pre-existing tools without pay.",
                    counterclause="Developer assigns to Client all IP created specifically for deliverables upon full payment. Developer retains all rights to pre-existing code, tools, and general knowledge.",
                    start_offset=781,
                    end_offset=1202
                ),
                Clause(
                    id="clause-3",
                    text="Client shall pay Developer within ninety (90) days of invoice approval. Client reserves the right to withhold payment at its sole discretion if Client deems any deliverable unsatisfactory or if project timelines slip for any reason.",
                    type=RiskType.DANGER,
                    category="Payment & Financial Terms",
                    title="90-Day Payment Delay & Unilateral Payment Withholding",
                    explanation="90 days is abnormally long for freelance work, and giving the client sole discretion to withhold payment effectively lets them refuse to pay for finished work.",
                    counterclause="Client shall pay Developer within thirty (30) days of invoice date. In the event of a good-faith dispute over a deliverable, Client may withhold only the specific disputed portion while paying the undisputed remainder.",
                    start_offset=1224,
                    end_offset=1463
                ),
                Clause(
                    id="clause-4",
                    text="Client may terminate this Agreement immediately at any time without cause and without payment for work in progress. Developer may only terminate upon sixty (60) days written notice and must refund all payments received to date.",
                    type=RiskType.DANGER,
                    category="Termination & Exit",
                    title="Asymmetric Instant Termination & Payment Refund",
                    explanation="Client can fire you instantly without paying for completed work, while you must give 60 days notice and refund all past earnings.",
                    counterclause="Either party may terminate this Agreement upon fourteen (14) days written notice. Upon termination, Client shall pay Developer for all work completed up to the effective termination date.",
                    start_offset=1481,
                    end_offset=1719
                ),
                Clause(
                    id="clause-5",
                    text="For a period of three (3) years following termination, Developer agrees not to perform software services for any entity in the technology sector worldwide.",
                    type=RiskType.DANGER,
                    category="Restrictive Covenants",
                    title="Overbroad 3-Year Worldwide Non-Compete",
                    explanation="A 3-year global ban on working in tech is excessive, unreasonable, and likely legally unenforceable in many jurisdictions.",
                    counterclause="For twelve (12) months post-termination, Developer shall not directly solicit Client's active customers for identical services specified in this Agreement.",
                    start_offset=1747,
                    end_offset=1906
                ),
                Clause(
                    id="clause-6",
                    text="This Agreement shall be governed by the laws of Client's jurisdiction.",
                    type=RiskType.WARNING,
                    category="Privacy, Access & Compliance",
                    title="Unspecified Client Jurisdiction",
                    explanation="Vague jurisdiction clause makes it unclear which state or country's courts govern legal disputes.",
                    counterclause="This Agreement shall be governed by the laws of the State of Delaware, without regard to its conflict of laws principles.",
                    start_offset=1928,
                    end_offset=1999
                ),
                Clause(
                    id="clause-7",
                    text="Developer agrees to perform software engineering and design services as specified in Statement of Work #1.",
                    type=RiskType.SAFE,
                    category="Scope of Work",
                    title="Standard Scope of Services",
                    explanation="Standard clear commitment to perform agreed work according to a Statement of Work.",
                    counterclause="Standard clause; no change necessary.",
                    start_offset=163,
                    end_offset=269
                )
            ],
            analysis_engine="heuristic",
            analysis_duration_ms=45
        )
    },
    {
        "id": "apartment_lease",
        "title": "Residential Lease Agreement",
        "category": "Real Estate & Housing",
        "description": "An apartment lease containing unannounced landlord entry rights, forfeiture of security deposit, and tenant liability for building structural repairs.",
        "text": """RESIDENTIAL LEASE AGREEMENT

This Lease Agreement is made between Landlord LLC ("Landlord") and Resident ("Tenant").

1. PREMISES & RENT
Tenant agrees to lease Apartment 4B for $2,500 per month, payable strictly on the 1st of each month.

2. LANDLORD ENTRY & ACCESS
Landlord reserves the right to enter the Premises at any time of day or night, without prior notice, for inspection, repairs, showing to prospective buyers, or any other purpose Landlord deems necessary.

3. SECURITY DEPOSIT
Tenant shall deposit $5,000 as a security deposit. Tenant agrees that Landlord may retain the entire security deposit upon move-out as a non-refundable cleaning fee, regardless of the physical condition or cleanliness of the Premises.

4. MAINTENANCE & REPAIRS
Tenant shall be solely responsible for all maintenance, structural repairs, plumbing, roof replacement, and HVAC repairs during the lease term, regardless of cause or age of equipment.

5. EARLY TERMINATION
If Tenant moves out before the end of the 12-month lease term, Tenant shall immediately owe the remaining balance of the full year's rent as liquidated damages.

6. UTILITIES
Tenant shall pay all utility accounts directly.""",
        "sample_analysis": AnalysisResult(
            overall_score=42,
            summary="This residential lease heavily favors the Landlord. It grants unannounced landlord entry at any hour, forfeits your security deposit automatically as a cleaning fee, forces tenants to pay for building structural and roof repairs, and imposes full rent acceleration upon early exit.",
            risk_counts={"danger": 4, "warning": 0, "safe": 2},
            category_scores={
                "Liability & Indemnification": 30,
                "Intellectual Property & Data": 100,
                "Payment & Financial Terms": 35,
                "Termination & Exit": 30,
                "Restrictive Covenants": 80,
                "Privacy, Access & Compliance": 15,
            },
            key_takeaways=[
                "CRITICAL RISK: Landlord can enter your apartment day or night without notice.",
                "HIGH RISK: Security deposit is automatically forfeited regardless of move-out condition.",
                "HIGH RISK: Tenant is forced to pay for structural building repairs and roof replacements.",
                "HIGH RISK: Moving out early forces payment of full remaining annual rent."
            ],
            clauses=[
                Clause(
                    id="clause-1",
                    text="Landlord reserves the right to enter the Premises at any time of day or night, without prior notice, for inspection, repairs, showing to prospective buyers, or any other purpose Landlord deems necessary.",
                    type=RiskType.DANGER,
                    category="Privacy, Access & Compliance",
                    title="Unannounced Landlord Entry Anytime",
                    explanation="Violates basic residential privacy rights. Landlords must give advance notice (usually 24 hours) except in genuine emergencies.",
                    counterclause="Landlord shall provide at least twenty-four (24) hours advance written notice before entering the Premises during reasonable business hours, except in emergency cases threatening life or property.",
                    start_offset=209,
                    end_offset=422
                ),
                Clause(
                    id="clause-2",
                    text="Tenant agrees that Landlord may retain the entire security deposit upon move-out as a non-refundable cleaning fee, regardless of the physical condition or cleanliness of the Premises.",
                    type=RiskType.DANGER,
                    category="Payment & Financial Terms",
                    title="Automatic Forfeiture of Security Deposit",
                    explanation="Security deposits must be returned less actual itemized damages. Automatically converting a $5,000 deposit into a non-refundable cleaning fee is predatory.",
                    counterclause="Landlord shall return the security deposit within thirty (30) days of move-out, minus itemized deductions for damages beyond normal wear and tear.",
                    start_offset=497,
                    end_offset=682
                ),
                Clause(
                    id="clause-3",
                    text="Tenant shall be solely responsible for all maintenance, structural repairs, plumbing, roof replacement, and HVAC repairs during the lease term, regardless of cause or age of equipment.",
                    type=RiskType.DANGER,
                    category="Liability & Indemnification",
                    title="Tenant Liable for Building Structural Repairs",
                    explanation="Structural repairs and roof/HVAC replacement are landlord capital expenses. Tenants should only pay for damage they directly cause.",
                    counterclause="Landlord shall maintain building structure, roof, plumbing, and HVAC in good working order. Tenant shall only be responsible for minor routine upkeep and damage caused by Tenant's negligence.",
                    start_offset=713,
                    end_offset=903
                ),
                Clause(
                    id="clause-4",
                    text="If Tenant moves out before the end of the 12-month lease term, Tenant shall immediately owe the remaining balance of the full year's rent as liquidated damages.",
                    type=RiskType.DANGER,
                    category="Termination & Exit",
                    title="Accelerated Rent Penalty on Early Exit",
                    explanation="Forces you to pay full annual rent upfront if you leave early, ignoring the landlord's legal duty to mitigate damages by finding a new tenant.",
                    counterclause="If Tenant terminates early, Tenant shall pay an early termination fee equal to two (2) months rent, after which all further rent obligations cease.",
                    start_offset=929,
                    end_offset=1092
                ),
                Clause(
                    id="clause-5",
                    text="Tenant agrees to lease Apartment 4B for $2,500 per month, payable strictly on the 1st of each month.",
                    type=RiskType.SAFE,
                    category="Payment & Financial Terms",
                    title="Standard Monthly Rent Clause",
                    explanation="Standard commercial terms specifying lease property and monthly rent due date.",
                    counterclause="Standard clause; no change necessary.",
                    start_offset=83,
                    end_offset=184
                ),
                Clause(
                    id="clause-6",
                    text="Tenant shall pay all utility accounts directly.",
                    type=RiskType.SAFE,
                    category="Payment & Financial Terms",
                    title="Direct Utility Responsibility",
                    explanation="Standard clear assignment of utility payment duties.",
                    counterclause="Standard clause; no change necessary.",
                    start_offset=1110,
                    end_offset=1157
                )
            ],
            analysis_engine="heuristic",
            analysis_duration_ms=38
        )
    },
    {
        "id": "saas_tos",
        "title": "SaaS Terms of Service",
        "category": "Software & Digital Services",
        "description": "Standard SaaS terms of service featuring unilateral fee increases, user content exploitation for AI model training, and compulsory arbitration with class-action waiver.",
        "text": """TERMS OF SERVICE FOR CLOUDFLOW

Welcome to CloudFlow ("Service"). By accessing our platform, you agree to these Terms.

1. DATA USAGE & AI TRAINING
You grant CloudFlow a perpetual, sublicensable, royalty-free license to access, analyze, share, and utilize all customer data uploaded to the Service for training public machine learning models and marketing.

2. PRICE & SUBSCRIPTION CHANGES
CloudFlow reserves the right to increase subscription fees by any percentage at any time without advance notice. Continued use after a price change constitutes acceptance.

3. LIMITATION OF LIABILITY
To the maximum extent permitted by law, CloudFlow's total aggregate liability for any service outage, data breach, or loss of data shall be limited to $1.00 USD.

4. ARBITRATION & CLASS ACTION WAIVER
All disputes arising under these Terms shall be resolved via binding individual arbitration in CloudFlow's home state. You explicitly waive all rights to participate in class actions.""",
        "sample_analysis": AnalysisResult(
            overall_score=48,
            summary="CloudFlow ToS contains several concerning digital terms: perpetual commercial AI training rights over your private uploaded data, surprise fee increases without notice, a $1 liability limit for data breaches, and a class-action waiver.",
            risk_counts={"danger": 3, "warning": 1, "safe": 0},
            category_scores={
                "Liability & Indemnification": 25,
                "Intellectual Property & Data": 35,
                "Payment & Financial Terms": 40,
                "Termination & Exit": 80,
                "Restrictive Covenants": 90,
                "Privacy, Access & Compliance": 50,
            },
            key_takeaways=[
                "HIGH RISK: Customer data is seized to train public AI models and for marketing without opt-out.",
                "HIGH RISK: Service fees can be increased by any percentage at any time without notice.",
                "HIGH RISK: Company liability for data breaches or outages is capped at $1.00."
            ],
            clauses=[
                Clause(
                    id="clause-1",
                    text="You grant CloudFlow a perpetual, sublicensable, royalty-free license to access, analyze, share, and utilize all customer data uploaded to the Service for training public machine learning models and marketing.",
                    type=RiskType.DANGER,
                    category="Intellectual Property & Data",
                    title="Perpetual User Data Seizure for AI Training",
                    explanation="Allows CloudFlow to use your private uploaded documents and data to train commercial AI models and share with third parties.",
                    counterclause="CloudFlow is granted a limited license to process Customer Data solely to provide the Service. CloudFlow shall not use Customer Data to train AI models without explicit opt-in consent.",
                    start_offset=145,
                    end_offset=347
                ),
                Clause(
                    id="clause-2",
                    text="CloudFlow reserves the right to increase subscription fees by any percentage at any time without advance notice. Continued use after a price change constitutes acceptance.",
                    type=RiskType.DANGER,
                    category="Payment & Financial Terms",
                    title="Unilateral Price Hikes Without Notice",
                    explanation="CloudFlow can double or triple subscription fees instantly without warning.",
                    counterclause="CloudFlow may adjust subscription fees upon providing at least thirty (30) days advance written notice prior to renewal.",
                    start_offset=384,
                    end_offset=557
                ),
                Clause(
                    id="clause-3",
                    text="To the maximum extent permitted by law, CloudFlow's total aggregate liability for any service outage, data breach, or loss of data shall be limited to $1.00 USD.",
                    type=RiskType.DANGER,
                    category="Liability & Indemnification",
                    title="$1 Liability Cap for Outages & Data Breaches",
                    explanation="If CloudFlow exposes your sensitive data in a breach or crashes your business, they only owe you $1.",
                    counterclause="CloudFlow's total aggregate liability for data breaches or outages shall be capped at the total amount paid by Customer in the preceding twelve (12) months.",
                    start_offset=594,
                    end_offset=758
                ),
                Clause(
                    id="clause-4",
                    text="All disputes arising under these Terms shall be resolved via binding individual arbitration in CloudFlow's home state. You explicitly waive all rights to participate in class actions.",
                    type=RiskType.WARNING,
                    category="Privacy, Access & Compliance",
                    title="Compulsory Arbitration & Class Action Waiver",
                    explanation="Standard corporate dispute clause forcing individual arbitration rather than court proceedings.",
                    counterclause="Disputes shall be resolved via binding arbitration conducted under JAMS rules in a mutually convenient location.",
                    start_offset=802,
                    end_offset=987
                )
            ],
            analysis_engine="heuristic",
            analysis_duration_ms=32
        )
    }
]

# Automatically compute character-exact start and end offsets for all sample clauses
for _sample in SAMPLE_CONTRACTS:
    for _clause in _sample["sample_analysis"].clauses:
        _pos = _sample["text"].find(_clause.text)
        if _pos != -1:
            _clause.start_offset = _pos
            _clause.end_offset = _pos + len(_clause.text)

def list_samples() -> List[Dict[str, Any]]:
    """Return all sample contracts without full text/analysis payloads for listing."""
    return [
        {
            "id": sample["id"],
            "title": sample["title"],
            "category": sample["category"],
            "description": sample["description"],
            "text": sample["text"],
            "sample_analysis": sample["sample_analysis"]
        }
        for sample in SAMPLE_CONTRACTS
    ]

def get_sample_by_id(sample_id: str) -> Dict[str, Any]:
    """Retrieve sample contract by ID or raise SampleNotFoundError."""
    for sample in SAMPLE_CONTRACTS:
        if sample["id"] == sample_id:
            return sample
    raise SampleNotFoundError(sample_id)
