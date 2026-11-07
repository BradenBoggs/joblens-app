import { getStoredToken } from '@/features/auth/token-store';

const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '');

/** The server answered with an error, or could not be reached (`status` 0). */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** True when nothing reached the server, so the request can be retried later. */
  get isOffline(): boolean {
    return this.status === 0;
  }

  firstError(): string {
    return Object.values(this.errors)[0]?.[0] ?? this.message;
  }
}

export function isApiConfigured(): boolean {
  return Boolean(apiUrl);
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  token?: string | null;
};

/** Call the JobLens mobile API (`/api/v1`) with the stored device token. */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!apiUrl) {
    throw new ApiError('The JobLens server address is not configured.', 0);
  }

  const token = options.token === undefined ? await getStoredToken() : options.token;
  let response: Response;

  try {
    response = await fetch(`${apiUrl}/api/v1${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError('No connection to JobLens.', 0);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json().catch(() => ({}))) as {
    message?: string;
    errors?: Record<string, string[]>;
  };

  if (!response.ok) {
    throw new ApiError(
      payload.message ?? `Request failed (${response.status}).`,
      response.status,
      payload.errors,
    );
  }

  return payload as T;
}
