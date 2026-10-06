import { useCallback } from 'react';
import { useAnalysisContext } from '../context/AnalysisContext';
import { api, ApiError } from '../services/api';
import { FALLBACK_SAMPLES } from '../data/fallbackSamples';

export function useAnalysis() {
  const { state, dispatch } = useAnalysisContext();

  const triggerAnalysis = useCallback(async () => {
    const text = state.contractText.trim();
    if (!text) {
      dispatch({ type: 'SET_ERROR', error: 'Please enter or paste a contract text to audit.' });
      return;
    }

    if (text.length < 50) {
      dispatch({ type: 'SET_ERROR', error: 'Contract text must be at least 50 characters long.' });
      return;
    }

    dispatch({ type: 'SET_ANALYZING', isAnalyzing: true });

    try {
      const result = await api.analyzeContract({
        contract_text: text,
        api_key: state.apiKey || undefined,
      });

      dispatch({ type: 'SET_ANALYSIS', result });
    } catch (err) {
      if (err instanceof ApiError) {
        dispatch({ type: 'SET_ERROR', error: err.message });
      } else if (err instanceof Error) {
        dispatch({ type: 'SET_ERROR', error: err.message });
      } else {
        dispatch({ type: 'SET_ERROR', error: 'An unexpected error occurred during analysis.' });
      }
    }
  }, [state.contractText, state.apiKey, dispatch]);

  const loadSample = useCallback((sampleId: string) => {
    const pool = state.samples.length > 0 ? state.samples : FALLBACK_SAMPLES;
    const sample = pool.find((s) => s.id === sampleId) || FALLBACK_SAMPLES.find((s) => s.id === sampleId);
    if (sample) {
      dispatch({ type: 'LOAD_SAMPLE', sample });
    }
  }, [state.samples, dispatch]);

  const setContractText = useCallback((text: string) => {
    dispatch({ type: 'SET_CONTRACT_TEXT', text });
  }, [dispatch]);

  const setActiveClause = useCallback((clauseId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_CLAUSE', clauseId });
  }, [dispatch]);

  const setViewMode = useCallback((mode: 'reader' | 'editor') => {
    dispatch({ type: 'SET_VIEW_MODE', mode });
  }, [dispatch]);

  const setApiKey = useCallback((apiKey: string) => {
    dispatch({ type: 'SET_API_KEY', apiKey });
  }, [dispatch]);

  const replaceClause = useCallback((originalText: string, replacementText: string) => {
    dispatch({ type: 'REPLACE_CLAUSE', originalText, replacementText });
  }, [dispatch]);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, [dispatch]);

  return {
    ...state,
    triggerAnalysis,
    loadSample,
    setContractText,
    setActiveClause,
    setViewMode,
    setApiKey,
    replaceClause,
    clearAll,
  };
}
