export type RiskType = 'danger' | 'warning' | 'safe';

export interface Clause {
  id: string;
  text: string;
  type: RiskType;
  category: string;
  title: string;
  explanation: string;
  counterclause: string;
  start_offset: number;
  end_offset: number;
}

export interface AnalysisResult {
  overall_score: number;
  summary: string;
  risk_counts: {
    danger: number;
    warning: number;
    safe: number;
    [key: string]: number;
  };
  category_scores: {
    [category: string]: number;
  };
  key_takeaways: string[];
  clauses: Clause[];
  analysis_engine: 'gemini' | 'heuristic' | 'minimal' | string;
  analysis_duration_ms?: number | null;
}

export interface SampleContract {
  id: string;
  title: string;
  category: string;
  description: string;
  text: string;
  sample_analysis: AnalysisResult;
}

export interface AnalyzeRequestPayload {
  contract_text: string;
  api_key?: string | null;
  contract_type?: string | null;
}

export interface ApiErrorResponse {
  error: boolean;
  error_code: string;
  message: string;
  details?: Record<string, unknown> | null;
}
