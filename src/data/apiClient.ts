const authTokenStorageKey = "meal-planner-auth-token";
export const authSessionExpiredEvent = "meal-planner:auth-session-expired";

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

export function notifyAuthSessionExpired(): void {
  clearAuthToken();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(authSessionExpiredEvent));
  }
}

export function authorizationHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: { notifyOnUnauthorized?: boolean } = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const authorization = authorizationHeaders().Authorization;
  if (authorization) headers.set("Authorization", authorization);

  const response = await fetch(input, { ...init, headers });
  if (response.status === 401 && options.notifyOnUnauthorized !== false) {
    notifyAuthSessionExpired();
  }
  return response;
}
