import {
  AnalysisResult,
  SampleContract,
  AnalyzeRequestPayload,
  ApiErrorResponse
} from '../types';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_TIMEOUT_MS = 35000; // 35 seconds timeout

async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorCode = 'UNKNOWN_ERROR';
      let message = `Request failed with status ${response.status}`;

      try {
        const errorJson: ApiErrorResponse = await response.json();
        if (errorJson && errorJson.message) {
          message = errorJson.message;
          errorCode = errorJson.error_code || errorCode;
        }
      } catch {
        // Response body was not JSON
      }

      throw new ApiError(response.status, errorCode, message);
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) {
      throw err;
    }

    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError(
        408,
        'TIMEOUT',
        'Analysis request timed out after 35 seconds. Please try again with a shorter contract.'
      );
    }

    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Cannot connect to ClauseLens analysis server. Please ensure the backend is running.'
    );
  }
}

export const api = {
  async healthCheck(): Promise<{ status: string; gemini_configured: boolean }> {
    return fetchWithTimeout<{ status: string; gemini_configured: boolean }>('/api/health');
  },

  async fetchSamples(): Promise<SampleContract[]> {
    const data = await fetchWithTimeout<{ samples: SampleContract[] }>('/api/samples');
    return data.samples;
  },

  async analyzeContract(payload: AnalyzeRequestPayload): Promise<AnalysisResult> {
    return fetchWithTimeout<AnalysisResult>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
