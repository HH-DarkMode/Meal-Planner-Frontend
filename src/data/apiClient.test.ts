import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch, authSessionExpiredEvent } from "./apiClient";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch", () => {
  it("clears the expired token and notifies the app after an unauthorized response", async () => {
    const storage = {
      getItem: vi.fn(() => "expired-token"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    const dispatchEvent = vi.fn();
    vi.stubGlobal("window", { localStorage: storage, dispatchEvent });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 401 })));

    await apiFetch("/api/profile");

    expect(storage.removeItem).toHaveBeenCalledWith("meal-planner-auth-token");
    expect(dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: authSessionExpiredEvent }),
    );
  });

  it("does not expire the session for forbidden responses", async () => {
    const dispatchEvent = vi.fn();
    vi.stubGlobal("window", {
      localStorage: { getItem: () => null, removeItem: vi.fn() },
      dispatchEvent,
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 403 })));

    await apiFetch("/api/profile");

    expect(dispatchEvent).not.toHaveBeenCalled();
  });
});
