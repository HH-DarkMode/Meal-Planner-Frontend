const authTokenStorageKey = "meal-planner-auth-token";

export function getAuthToken(): string | null {
  return typeof window === "undefined" ? null : window.localStorage.getItem(authTokenStorageKey);
}

export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(authTokenStorageKey, token);
  }
}

export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(authTokenStorageKey);
  }
}

export function authorizationHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const authorization = authorizationHeaders().Authorization;
  if (authorization) headers.set("Authorization", authorization);

  return fetch(input, { ...init, headers });
}
