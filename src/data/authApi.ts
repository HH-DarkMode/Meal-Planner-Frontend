import {
  apiFetch,
  clearAuthToken,
  getAuthToken,
  notifyAuthSessionExpired,
  setAuthToken,
} from "./apiClient";

const authApi = `${import.meta.env.VITE_BACKEND_URL}/api/auth`;

export type AuthUser = {
  username: string;
};

type AuthResponse = AuthUser & {
  token?: string;
};

class AuthRequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request(path: string, options: RequestInit = {}): Promise<AuthResponse | null> {
  const response = await apiFetch(`${authApi}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  }, { notifyOnUnauthorized: false });

  if (response.status === 204) return null;
  if (!response.ok) {
    const error = await response.json().catch(() => null) as { message?: string } | null;
    throw new AuthRequestError(response.status, error?.message ?? "Authentication request failed");
  }
  return response.json() as Promise<AuthResponse>;
}

async function authenticate(path: "/login" | "/register", username: string, password: string): Promise<AuthUser> {
  clearAuthToken();
  const response = await request(path, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  if (!response?.username || !response.token) {
    throw new Error("Authentication response did not include a username and token");
  }

  setAuthToken(response.token);
  return { username: response.username };
}

export function getCurrentUser(): Promise<AuthUser | null> {
  return request("/me").catch(async (error: unknown) => {
    if (!(error instanceof AuthRequestError) || (error.status !== 401 && error.status !== 403)) {
      throw error;
    }

    if (!getAuthToken()) return null;
    clearAuthToken();

    try {
      return await request("/me");
    } catch (fallbackError) {
      if (fallbackError instanceof AuthRequestError
        && (fallbackError.status === 401 || fallbackError.status === 403)) {
        notifyAuthSessionExpired();
        return null;
      }
      throw fallbackError;
    }
  });
}

export function login(username: string, password: string): Promise<AuthUser | null> {
  return authenticate("/login", username, password);
}

export function register(username: string, password: string): Promise<AuthUser | null> {
  return authenticate("/register", username, password);
}

export function logout(): Promise<AuthUser | null> {
  return request("/logout", { method: "POST" }).finally(clearAuthToken);
}
