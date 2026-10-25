import { afterEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser, login } from "./authApi";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("authApi", () => {
  it("treats an unauthenticated session as empty", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(null, { status: 403 }),
    ));

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("sends credentials and the login payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ username: "test-user" }), {
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
  });
});
