import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import { AnalysisResult, SampleContract } from '../types';

interface AnalysisState {
  contractText: string;
  analysis: AnalysisResult | null;
  activeClauseId: string | null;
  viewMode: 'reader' | 'editor';
  isAnalyzing: boolean;
  analysisError: string | null;
  apiKey: string;
  samples: SampleContract[];
  samplesLoading: boolean;
}

type AnalysisAction =
  | { type: 'SET_CONTRACT_TEXT'; text: string }
  | { type: 'SET_ANALYSIS'; result: AnalysisResult }
  | { type: 'SET_ACTIVE_CLAUSE'; clauseId: string | null }
  | { type: 'SET_VIEW_MODE'; mode: 'reader' | 'editor' }
  | { type: 'SET_ANALYZING'; isAnalyzing: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_API_KEY'; apiKey: string }
  | { type: 'SET_SAMPLES'; samples: SampleContract[] }
  | { type: 'SET_SAMPLES_LOADING'; loading: boolean }
  | { type: 'LOAD_SAMPLE'; sample: SampleContract }
  | { type: 'REPLACE_CLAUSE'; originalText: string; replacementText: string }
  | { type: 'CLEAR_ALL' };

const API_KEY_STORAGE_KEY = 'clauselens_gemini_api_key';

const getInitialApiKey = (): string => {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
  } catch {
    return '';
  }
};

const initialState: AnalysisState = {
  contractText: '',
  analysis: null,
  activeClauseId: null,
  viewMode: 'editor',
  isAnalyzing: false,
  analysisError: null,
  apiKey: getInitialApiKey(),
  samples: [],
  samplesLoading: false,
};

function analysisReducer(state: AnalysisState, action: AnalysisAction): AnalysisState {
  switch (action.type) {
    case 'SET_CONTRACT_TEXT':
      return {
        ...state,
        contractText: action.text,
        analysisError: null,
      };

    case 'SET_ANALYSIS':
      return {
        ...state,
        analysis: action.result,
        viewMode: 'reader',
        activeClauseId: action.result.clauses.length > 0 ? action.result.clauses[0].id : null,
        isAnalyzing: false,
        analysisError: null,
      };

    case 'SET_ACTIVE_CLAUSE':
      return {
        ...state,
        activeClauseId: action.clauseId,
      };

    case 'SET_VIEW_MODE':
      return {
        ...state,
        viewMode: action.mode,
      };

    case 'SET_ANALYZING':
      return {
        ...state,
        isAnalyzing: action.isAnalyzing,
        analysisError: action.isAnalyzing ? null : state.analysisError,
      };

    case 'SET_ERROR':
      return {
        ...state,
        analysisError: action.error,
        isAnalyzing: false,
      };

    case 'SET_API_KEY':
      try {
        localStorage.setItem(API_KEY_STORAGE_KEY, action.apiKey);
      } catch {
        // Handle incognito or disabled localStorage safely
      }
      return {
        ...state,
        apiKey: action.apiKey,
      };

    case 'SET_SAMPLES':
      return {
        ...state,
        samples: action.samples,
        samplesLoading: false,
      };

    case 'SET_SAMPLES_LOADING':
      return {
        ...state,
        samplesLoading: action.loading,
      };

    case 'LOAD_SAMPLE':
      return {
        ...state,
        contractText: action.sample.text,
        analysis: null,
        viewMode: 'editor',
        activeClauseId: null,
        analysisError: null,
      };

    case 'REPLACE_CLAUSE': {
      if (!state.contractText || !action.originalText) return state;
      const updatedText = state.contractText.replace(action.originalText, action.replacementText);
      return {
        ...state,
        contractText: updatedText,
      };
    }

    case 'CLEAR_ALL':
      return {
        ...state,
        contractText: '',
        analysis: null,
        activeClauseId: null,
        viewMode: 'editor',
        analysisError: null,
      };

    default:
      return state;
  }
}

interface AnalysisContextType {
  state: AnalysisState;
  dispatch: React.Dispatch<AnalysisAction>;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(analysisReducer, initialState);

  return (
    <AnalysisContext.Provider value={{ state, dispatch }}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysisContext = (): AnalysisContextType => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysisContext must be used within an AnalysisProvider');
  }
  return context;
};
