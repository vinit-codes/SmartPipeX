import type { ApiResponse } from '@/lib/types';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code = 'REQUEST_FAILED',
    public readonly status?: number
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export interface ApiResult<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export async function fetchApiResult<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ApiResult<T>> {
  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  });

  let payload: ApiResponse<T>;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError(
      'The server returned an invalid response.',
      'INVALID_RESPONSE',
      response.status
    );
  }

  if (!response.ok || !payload.success) {
    const error = payload.success
      ? { code: 'REQUEST_FAILED', message: 'The request failed.' }
      : payload.error;
    throw new ApiClientError(error.message, error.code, response.status);
  }

  return { data: payload.data, meta: payload.meta };
}

export async function fetchApi<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const result = await fetchApiResult<T>(input, init);
  return result.data;
}
