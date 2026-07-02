// Klien HTTP tunggal ke NestJS. UI TIDAK PERNAH akses OpenClaw/Ginee/DB
// langsung — selalu lewat sini (Golden Rule #2). Token JWT dibawa via cookie
// agar bisa dicek middleware (guard rute) sekaligus dikirim sebagai Bearer.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export const TOKEN_COOKIE = 'sf_token';
const TOKEN_MAX_AGE = 8 * 60 * 60; // 8 jam — samakan dengan JWT expiry (SRS §19)

export function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )sf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function setToken(token: string): void {
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${TOKEN_MAX_AGE}; SameSite=Lax`;
}

export function clearToken(): void {
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

// Error yang membawa HTTP status + pesan actionable dari backend (Golden Rule #8).
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean; // sertakan Bearer token (default: true)
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Tidak bisa terhubung ke server. Cek koneksi.');
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    // Nest mengirim { message: string | string[] }. Gabung array agar actionable.
    const raw = (payload as { message?: string | string[] } | null)?.message;
    const message = Array.isArray(raw) ? raw.join(' ') : (raw ?? 'Terjadi kesalahan.');
    throw new ApiError(res.status, message);
  }

  return payload as T;
}
