import { afterEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser, login } from "./authApi";
import { getAuthToken } from "./apiClient";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("authApi", () => {
  const localStorage = () => {
    const values = new Map<string, string>();
    return {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    };
  };

  it("treats an unauthenticated session as empty", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(null, { status: 403 }),
    ));

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("sends credentials and the login payload", async () => {
    const storage = localStorage();
    vi.stubGlobal("window", { localStorage: storage });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ username: "test-user", token: "jwt-token" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(login("test-user", "password-123")).resolves.toEqual({ username: "test-user" });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/login"),
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ username: "test-user", password: "password-123" }),
      }),
    );
    const [, options] = fetchMock.mock.calls[0];
    expect(new Headers(options.headers).get("Content-Type")).toBe("application/json");
    expect(new Headers(options.headers).get("Authorization")).toBeNull();
    expect(getAuthToken()).toBe("jwt-token");
  });

  it("sends the stored bearer token for the current-user request", async () => {
    const storage = localStorage();
    storage.setItem("meal-planner-auth-token", "jwt-token");
    vi.stubGlobal("window", { localStorage: storage });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ username: "test-user" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCurrentUser()).resolves.toEqual({ username: "test-user" });

    const [, options] = fetchMock.mock.calls[0];
    expect(new Headers(options.headers).get("Authorization")).toBe("Bearer jwt-token");
  });

  it("falls back to the HttpOnly cookie if the stored token is rejected", async () => {
    const storage = localStorage();
    storage.setItem("meal-planner-auth-token", "expired-token");
    vi.stubGlobal("window", { localStorage: storage });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ username: "test-user" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCurrentUser()).resolves.toEqual({ username: "test-user" });
    expect(new Headers(fetchMock.mock.calls[0][1].headers).get("Authorization")).toBe("Bearer expired-token");
    expect(new Headers(fetchMock.mock.calls[1][1].headers).get("Authorization")).toBeNull();
    expect(getAuthToken()).toBeNull();
  });
});
