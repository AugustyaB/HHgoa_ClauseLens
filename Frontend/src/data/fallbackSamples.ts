import { SampleContract } from '../types';

export const FALLBACK_SAMPLES: SampleContract[] = [
  {
    "id": "freelance_dev",
    "title": "Freelance Software Development Agreement",
    "category": "Freelance & Consulting",
    "description": "A software development agreement containing predatory indemnification, perpetual IP assignment, and uncompensated delay clauses.",
    "text": "FREELANCE SOFTWARE DEVELOPMENT AGREEMENT\n\nThis Agreement is entered into by and between Client Inc. (\"Client\") and Contractor (\"Developer\").\n\n1. SCOPE OF SERVICES\nDeveloper agrees to perform software engineering and design services as specified in Statement of Work #1.\n\n2. INDEMNIFICATION & LIABILITY\nDeveloper shall defend, indemnify, and hold harmless Client, its officers, and affiliates from any and all claims, damages, liabilities, costs, and expenses (including attorneys' fees) arising out of or related to any breach of this Agreement or any fault, negligence, or error in deliverables, regardless of whether Client contributed to such fault. Developer's liability under this section shall be unlimited.\n\n3. INTELLECTUAL PROPERTY RIGHTS\nDeveloper hereby unconditionally assigns to Client all right, title, and interest in all code, documentation, designs, and inventions created under this Agreement, as well as all prior inventions created by Developer at any time. Developer grants Client an irrevocable right to use Developer's name, likeness, and confidential pre-existing tools for AI training and commercial monetization without compensation.\n\n4. PAYMENT TERMS\nClient shall pay Developer within ninety (90) days of invoice approval. Client reserves the right to withhold payment at its sole discretion if Client deems any deliverable unsatisfactory or if project timelines slip for any reason.\n\n5. TERMINATION\nClient may terminate this Agreement immediately at any time without cause and without payment for work in progress. Developer may only terminate upon sixty (60) days written notice and must refund all payments received to date.\n\n6. RESTRICTIVE COVENANTS\nFor a period of three (3) years following termination, Developer agrees not to perform software services for any entity in the technology sector worldwide.\n\n7. GOVERNING LAW\nThis Agreement shall be governed by the laws of Client's jurisdiction.",
    "sample_analysis": {
      "overall_score": 34,
      "summary": "This agreement is severely predatory toward the Developer. It imposes unlimited indemnification regardless of fault, perpetual IP seizure including pre-existing tools, 90-day delayed payment with unilateral withholding, instant client termination without pay, and a 3-year global non-compete.",
      "risk_counts": {
        "danger": 5,
        "warning": 1,
        "safe": 1
      },
      "category_scores": {
        "Liability & Indemnification": 15,
        "Intellectual Property & Data": 25,
        "Payment & Financial Terms": 30,
        "Termination & Exit": 20,
        "Restrictive Covenants": 20,
        "Privacy, Access & Compliance": 80
      },
      "key_takeaways": [
        "CRITICAL RISK: Developer bears unlimited liability and indemnifies Client even when Client is at fault.",
        "HIGH RISK: Client seizes prior inventions and pre-existing tools for AI training without royalty.",
        "HIGH RISK: 90-day payment terms with unilateral right to withhold payment at Client's sole discretion.",
        "HIGH RISK: 3-year global non-compete severely restricts Developer's livelihood."
      ],
      "clauses": [
        {
          "id": "clause-1",
          "text": "Developer shall defend, indemnify, and hold harmless Client, its officers, and affiliates from any and all claims, damages, liabilities, costs, and expenses (including attorneys' fees) arising out of or related to any breach of this Agreement or any fault, negligence, or error in deliverables, regardless of whether Client contributed to such fault. Developer's liability under this section shall be unlimited.",
          "type": "danger",
          "category": "Liability & Indemnification",
          "title": "Unlimited One-Sided Indemnification",
          "explanation": "Forces you to pay all legal fees and damages even if the client contributed to the mistake. Your financial exposure is unlimited.",
          "counterclause": "Each party shall indemnify and hold harmless the other party from third-party claims arising solely from its gross negligence or willful misconduct. Neither party's total aggregate liability shall exceed the fees paid under this Agreement.",
          "start_offset": 302,
          "end_offset": 713
        },
        {
          "id": "clause-2",
          "text": "Developer hereby unconditionally assigns to Client all right, title, and interest in all code, documentation, designs, and inventions created under this Agreement, as well as all prior inventions created by Developer at any time. Developer grants Client an irrevocable right to use Developer's name, likeness, and confidential pre-existing tools for AI training and commercial monetization without compensation.",
          "type": "danger",
          "category": "Intellectual Property & Data",
          "title": "Seizure of Prior IP & Uncompensated AI Exploitation",
          "explanation": "Claims ownership of inventions you built prior to this contract and allows them to train AI on your confidential pre-existing tools without pay.",
          "counterclause": "Developer assigns to Client all IP created specifically for deliverables upon full payment. Developer retains all rights to pre-existing code, tools, and general knowledge.",
          "start_offset": 747,
          "end_offset": 1158
        },
        {
          "id": "clause-3",
          "text": "Client shall pay Developer within ninety (90) days of invoice approval. Client reserves the right to withhold payment at its sole discretion if Client deems any deliverable unsatisfactory or if project timelines slip for any reason.",
          "type": "danger",
          "category": "Payment & Financial Terms",
          "title": "90-Day Payment Delay & Unilateral Payment Withholding",
          "explanation": "90 days is abnormally long for freelance work, and giving the client sole discretion to withhold payment effectively lets them refuse to pay for finished work.",
          "counterclause": "Client shall pay Developer within thirty (30) days of invoice date. In the event of a good-faith dispute over a deliverable, Client may withhold only the specific disputed portion while paying the undisputed remainder.",
          "start_offset": 1177,
          "end_offset": 1409
        },
        {
          "id": "clause-4",
          "text": "Client may terminate this Agreement immediately at any time without cause and without payment for work in progress. Developer may only terminate upon sixty (60) days written notice and must refund all payments received to date.",
          "type": "danger",
          "category": "Termination & Exit",
          "title": "Asymmetric Instant Termination & Payment Refund",
          "explanation": "Client can fire you instantly without paying for completed work, while you must give 60 days notice and refund all past earnings.",
          "counterclause": "Either party may terminate this Agreement upon fourteen (14) days written notice. Upon termination, Client shall pay Developer for all work completed up to the effective termination date.",
          "start_offset": 1426,
          "end_offset": 1653
        },
        {
          "id": "clause-5",
          "text": "For a period of three (3) years following termination, Developer agrees not to perform software services for any entity in the technology sector worldwide.",
          "type": "danger",
          "category": "Restrictive Covenants",
          "title": "Overbroad 3-Year Worldwide Non-Compete",
          "explanation": "A 3-year global ban on working in tech is excessive, unreasonable, and likely legally unenforceable in many jurisdictions.",
          "counterclause": "For twelve (12) months post-termination, Developer shall not directly solicit Client's active customers for identical services specified in this Agreement.",
          "start_offset": 1680,
          "end_offset": 1835
        },
        {
          "id": "clause-6",
          "text": "This Agreement shall be governed by the laws of Client's jurisdiction.",
          "type": "warning",
          "category": "Privacy, Access & Compliance",
          "title": "Unspecified Client Jurisdiction",
          "explanation": "Vague jurisdiction clause makes it unclear which state or country's courts govern legal disputes.",
          "counterclause": "This Agreement shall be governed by the laws of the State of Delaware, without regard to its conflict of laws principles.",
          "start_offset": 1854,
          "end_offset": 1924
        },
        {
          "id": "clause-7",
          "text": "Developer agrees to perform software engineering and design services as specified in Statement of Work #1.",
          "type": "safe",
          "category": "Scope of Work",
          "title": "Standard Scope of Services",
          "explanation": "Standard clear commitment to perform agreed work according to a Statement of Work.",
          "counterclause": "Standard clause; no change necessary.",
          "start_offset": 163,
          "end_offset": 269
        }
      ],
      "analysis_engine": "heuristic",
      "analysis_duration_ms": 45
    }
  },
  {
    "id": "apartment_lease",
    "title": "Residential Lease Agreement",
    "category": "Real Estate & Housing",
    "description": "An apartment lease containing unannounced landlord entry rights, forfeiture of security deposit, and tenant liability for building structural repairs.",
    "text": "RESIDENTIAL LEASE AGREEMENT\n\nThis Lease Agreement is made between Landlord LLC (\"Landlord\") and Resident (\"Tenant\").\n\n1. PREMISES & RENT\nTenant agrees to lease Apartment 4B for $2,500 per month, payable strictly on the 1st of each month.\n\n2. LANDLORD ENTRY & ACCESS\nLandlord reserves the right to enter the Premises at any time of day or night, without prior notice, for inspection, repairs, showing to prospective buyers, or any other purpose Landlord deems necessary.\n\n3. SECURITY DEPOSIT\nTenant shall deposit $5,000 as a security deposit. Tenant agrees that Landlord may retain the entire security deposit upon move-out as a non-refundable cleaning fee, regardless of the physical condition or cleanliness of the Premises.\n\n4. MAINTENANCE & REPAIRS\nTenant shall be solely responsible for all maintenance, structural repairs, plumbing, roof replacement, and HVAC repairs during the lease term, regardless of cause or age of equipment.\n\n5. EARLY TERMINATION\nIf Tenant moves out before the end of the 12-month lease term, Tenant shall immediately owe the remaining balance of the full year's rent as liquidated damages.\n\n6. UTILITIES\nTenant shall pay all utility accounts directly.",
    "sample_analysis": {
      "overall_score": 42,
      "summary": "This residential lease heavily favors the Landlord. It grants unannounced landlord entry at any hour, forfeits your security deposit automatically as a cleaning fee, forces tenants to pay for building structural and roof repairs, and imposes full rent acceleration upon early exit.",
      "risk_counts": {
        "danger": 4,
        "warning": 0,
        "safe": 2
      },
      "category_scores": {
        "Liability & Indemnification": 30,
        "Intellectual Property & Data": 100,
        "Payment & Financial Terms": 35,
        "Termination & Exit": 30,
        "Restrictive Covenants": 80,
        "Privacy, Access & Compliance": 15
      },
      "key_takeaways": [
        "CRITICAL RISK: Landlord can enter your apartment day or night without notice.",
        "HIGH RISK: Security deposit is automatically forfeited regardless of move-out condition.",
        "HIGH RISK: Tenant is forced to pay for structural building repairs and roof replacements.",
        "HIGH RISK: Moving out early forces payment of full remaining annual rent."
      ],
      "clauses": [
        {
          "id": "clause-1",
          "text": "Landlord reserves the right to enter the Premises at any time of day or night, without prior notice, for inspection, repairs, showing to prospective buyers, or any other purpose Landlord deems necessary.",
          "type": "danger",
          "category": "Privacy, Access & Compliance",
          "title": "Unannounced Landlord Entry Anytime",
          "explanation": "Violates basic residential privacy rights. Landlords must give advance notice (usually 24 hours) except in genuine emergencies.",
          "counterclause": "Landlord shall provide at least twenty-four (24) hours advance written notice before entering the Premises during reasonable business hours, except in emergency cases threatening life or property.",
          "start_offset": 266,
          "end_offset": 469
        },
        {
          "id": "clause-2",
          "text": "Tenant agrees that Landlord may retain the entire security deposit upon move-out as a non-refundable cleaning fee, regardless of the physical condition or cleanliness of the Premises.",
          "type": "danger",
          "category": "Payment & Financial Terms",
          "title": "Automatic Forfeiture of Security Deposit",
          "explanation": "Security deposits must be returned less actual itemized damages. Automatically converting a $5,000 deposit into a non-refundable cleaning fee is predatory.",
          "counterclause": "Landlord shall return the security deposit within thirty (30) days of move-out, minus itemized deductions for damages beyond normal wear and tear.",
          "start_offset": 542,
          "end_offset": 725
        },
        {
          "id": "clause-3",
          "text": "Tenant shall be solely responsible for all maintenance, structural repairs, plumbing, roof replacement, and HVAC repairs during the lease term, regardless of cause or age of equipment.",
          "type": "danger",
          "category": "Liability & Indemnification",
          "title": "Tenant Liable for Building Structural Repairs",
          "explanation": "Structural repairs and roof/HVAC replacement are landlord capital expenses. Tenants should only pay for damage they directly cause.",
          "counterclause": "Landlord shall maintain building structure, roof, plumbing, and HVAC in good working order. Tenant shall only be responsible for minor routine upkeep and damage caused by Tenant's negligence.",
          "start_offset": 752,
          "end_offset": 936
        },
        {
          "id": "clause-4",
          "text": "If Tenant moves out before the end of the 12-month lease term, Tenant shall immediately owe the remaining balance of the full year's rent as liquidated damages.",
          "type": "danger",
          "category": "Termination & Exit",
          "title": "Accelerated Rent Penalty on Early Exit",
          "explanation": "Forces you to pay full annual rent upfront if you leave early, ignoring the landlord's legal duty to mitigate damages by finding a new tenant.",
          "counterclause": "If Tenant terminates early, Tenant shall pay an early termination fee equal to two (2) months rent, after which all further rent obligations cease.",
          "start_offset": 959,
          "end_offset": 1119
        },
        {
          "id": "clause-5",
          "text": "Tenant agrees to lease Apartment 4B for $2,500 per month, payable strictly on the 1st of each month.",
          "type": "safe",
          "category": "Payment & Financial Terms",
          "title": "Standard Monthly Rent Clause",
          "explanation": "Standard commercial terms specifying lease property and monthly rent due date.",
          "counterclause": "Standard clause; no change necessary.",
          "start_offset": 137,
          "end_offset": 237
        },
        {
          "id": "clause-6",
          "text": "Tenant shall pay all utility accounts directly.",
          "type": "safe",
          "category": "Payment & Financial Terms",
          "title": "Direct Utility Responsibility",
          "explanation": "Standard clear assignment of utility payment duties.",
          "counterclause": "Standard clause; no change necessary.",
          "start_offset": 1134,
          "end_offset": 1181
        }
      ],
      "analysis_engine": "heuristic",
      "analysis_duration_ms": 38
    }
  },
  {
    "id": "saas_tos",
    "title": "SaaS Terms of Service",
    "category": "Software & Digital Services",
    "description": "Standard SaaS terms of service featuring unilateral fee increases, user content exploitation for AI model training, and compulsory arbitration with class-action waiver.",
    "text": "TERMS OF SERVICE FOR CLOUDFLOW\n\nWelcome to CloudFlow (\"Service\"). By accessing our platform, you agree to these Terms.\n\n1. DATA USAGE & AI TRAINING\nYou grant CloudFlow a perpetual, sublicensable, royalty-free license to access, analyze, share, and utilize all customer data uploaded to the Service for training public machine learning models and marketing.\n\n2. PRICE & SUBSCRIPTION CHANGES\nCloudFlow reserves the right to increase subscription fees by any percentage at any time without advance notice. Continued use after a price change constitutes acceptance.\n\n3. LIMITATION OF LIABILITY\nTo the maximum extent permitted by law, CloudFlow's total aggregate liability for any service outage, data breach, or loss of data shall be limited to $1.00 USD.\n\n4. ARBITRATION & CLASS ACTION WAIVER\nAll disputes arising under these Terms shall be resolved via binding individual arbitration in CloudFlow's home state. You explicitly waive all rights to participate in class actions.",
    "sample_analysis": {
      "overall_score": 48,
      "summary": "CloudFlow ToS contains several concerning digital terms: perpetual commercial AI training rights over your private uploaded data, surprise fee increases without notice, a $1 liability limit for data breaches, and a class-action waiver.",
      "risk_counts": {
        "danger": 3,
        "warning": 1,
        "safe": 0
      },
      "category_scores": {
        "Liability & Indemnification": 25,
        "Intellectual Property & Data": 35,
        "Payment & Financial Terms": 40,
        "Termination & Exit": 80,
        "Restrictive Covenants": 90,
        "Privacy, Access & Compliance": 50
      },
      "key_takeaways": [
        "HIGH RISK: Customer data is seized to train public AI models and for marketing without opt-out.",
        "HIGH RISK: Service fees can be increased by any percentage at any time without notice.",
        "HIGH RISK: Company liability for data breaches or outages is capped at $1.00."
      ],
      "clauses": [
        {
          "id": "clause-1",
          "text": "You grant CloudFlow a perpetual, sublicensable, royalty-free license to access, analyze, share, and utilize all customer data uploaded to the Service for training public machine learning models and marketing.",
          "type": "danger",
          "category": "Intellectual Property & Data",
          "title": "Perpetual User Data Seizure for AI Training",
          "explanation": "Allows CloudFlow to use your private uploaded documents and data to train commercial AI models and share with third parties.",
          "counterclause": "CloudFlow is granted a limited license to process Customer Data solely to provide the Service. CloudFlow shall not use Customer Data to train AI models without explicit opt-in consent.",
          "start_offset": 148,
          "end_offset": 356
        },
        {
          "id": "clause-2",
          "text": "CloudFlow reserves the right to increase subscription fees by any percentage at any time without advance notice. Continued use after a price change constitutes acceptance.",
          "type": "danger",
          "category": "Payment & Financial Terms",
          "title": "Unilateral Price Hikes Without Notice",
          "explanation": "CloudFlow can double or triple subscription fees instantly without warning.",
          "counterclause": "CloudFlow may adjust subscription fees upon providing at least thirty (30) days advance written notice prior to renewal.",
          "start_offset": 390,
          "end_offset": 561
        },
        {
          "id": "clause-3",
          "text": "To the maximum extent permitted by law, CloudFlow's total aggregate liability for any service outage, data breach, or loss of data shall be limited to $1.00 USD.",
          "type": "danger",
          "category": "Liability & Indemnification",
          "title": "$1 Liability Cap for Outages & Data Breaches",
          "explanation": "If CloudFlow exposes your sensitive data in a breach or crashes your business, they only owe you $1.",
          "counterclause": "CloudFlow's total aggregate liability for data breaches or outages shall be capped at the total amount paid by Customer in the preceding twelve (12) months.",
          "start_offset": 590,
          "end_offset": 751
        },
        {
          "id": "clause-4",
          "text": "All disputes arising under these Terms shall be resolved via binding individual arbitration in CloudFlow's home state. You explicitly waive all rights to participate in class actions.",
          "type": "warning",
          "category": "Privacy, Access & Compliance",
          "title": "Compulsory Arbitration & Class Action Waiver",
          "explanation": "Standard corporate dispute clause forcing individual arbitration rather than court proceedings.",
          "counterclause": "Disputes shall be resolved via binding arbitration conducted under JAMS rules in a mutually convenient location.",
          "start_offset": 790,
          "end_offset": 973
        }
      ],
      "analysis_engine": "heuristic",
      "analysis_duration_ms": 32
    }
  }
];
