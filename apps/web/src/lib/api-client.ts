type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options?: RequestOptions
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let url = `${BASE_URL}${path}`;
  if (options?.params) {
    const searchParams = new URLSearchParams(options.params);
    url += `?${searchParams.toString()}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error: ApiError = {
      status: res.status,
      message: "An unexpected error occurred",
    };
    try {
      const data = await res.json();
      error.message = data.message || data.detail || error.message;
      error.errors = data.errors;
    } catch {
      error.message = res.statusText || error.message;
    }
    throw error;
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, body, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, undefined, options),
};
