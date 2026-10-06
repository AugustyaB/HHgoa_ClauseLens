import { useEffect } from 'react';
import { useAnalysisContext } from '../context/AnalysisContext';
import { api } from '../services/api';
import { FALLBACK_SAMPLES } from '../data/fallbackSamples';

export function useSamples() {
  const { state, dispatch } = useAnalysisContext();

  useEffect(() => {
    // If samples are already loaded in state, nothing to do
    if (state.samples.length > 0) return;

    // Immediately seed state with fallback samples so UI is never empty or stuck
    dispatch({ type: 'SET_SAMPLES', samples: FALLBACK_SAMPLES });

    let isSubscribed = true;

    // Attempt to sync with backend API
    api
      .fetchSamples()
      .then((serverSamples) => {
        if (isSubscribed && serverSamples && serverSamples.length > 0) {
          dispatch({ type: 'SET_SAMPLES', samples: serverSamples });
        }
      })
      .catch((err) => {
        if (isSubscribed) {
          console.warn('Backend samples fetch failed, using fallback samples:', err);
          dispatch({ type: 'SET_SAMPLES_LOADING', loading: false });
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [state.samples.length, dispatch]);

  return {
    samples: state.samples.length > 0 ? state.samples : FALLBACK_SAMPLES,
    loading: state.samplesLoading && state.samples.length === 0,
  };
}
