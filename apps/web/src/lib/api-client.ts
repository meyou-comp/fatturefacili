const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;
  constructor(baseUrl: string) { this.baseUrl = baseUrl; }

  private async request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const { body, headers, ...rest } = opts;
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...rest,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Errore di rete' }));
      throw new ApiError(res.status, err.message || 'Errore del server');
    }
    return res.json();
  }

  get<T>(path: string, opts?: RequestOptions) { return this.request<T>(path, { ...opts, method: 'GET' }); }
  post<T>(path: string, body?: unknown, opts?: RequestOptions) { return this.request<T>(path, { ...opts, method: 'POST', body }); }
  put<T>(path: string, body?: unknown, opts?: RequestOptions) { return this.request<T>(path, { ...opts, method: 'PUT', body }); }
  delete<T>(path: string, opts?: RequestOptions) { return this.request<T>(path, { ...opts, method: 'DELETE' }); }
}

export const api = new ApiClient(API_BASE);
