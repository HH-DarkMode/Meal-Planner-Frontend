const authApi = `${import.meta.env.VITE_BACKEND_URL}/api/auth`;

export type AuthUser = {
  username: string;
};

class AuthRequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request(path: string, options: RequestInit = {}): Promise<AuthUser | null> {
  const response = await fetch(`${authApi}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  if (response.status === 204) return null;
  if (!response.ok) {
    const error = await response.json().catch(() => null) as { message?: string } | null;
    throw new AuthRequestError(response.status, error?.message ?? "Authentication request failed");
  }
  return response.json() as Promise<AuthUser>;
}

export function getCurrentUser(): Promise<AuthUser | null> {
  return request("/me").catch((error: unknown) => {
    if (error instanceof AuthRequestError && (error.status === 401 || error.status === 403)) return null;
    throw error;
  });
}

export function login(username: string, password: string): Promise<AuthUser | null> {
  return request("/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function register(username: string, password: string): Promise<AuthUser | null> {
  return request("/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function logout(): Promise<AuthUser | null> {
  return request("/logout", { method: "POST" });
}
