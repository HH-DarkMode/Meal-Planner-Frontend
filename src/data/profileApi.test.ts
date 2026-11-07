import { afterEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { emptyProfile } from "./profile";
import { getProfile, normalizeProfile, saveProfile } from "./profileApi";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("normalizeProfile", () => {
  it("keeps an incomplete backend profile safe for the UI", () => {
    expect(normalizeProfile({
      username: null as never,
      gender: null as never,
      goal: null as never,
      diets: null as never,
    })).toEqual(emptyProfile);
  });

  it("preserves saved profile values", () => {
    expect(normalizeProfile({
      username: "Test User",
      weight: 80,
      diets: ["vegan"],
    })).toMatchObject({
      username: "Test User",
      weight: 80,
      diets: ["vegan"],
    });
  });

});

describe("profileApi", () => {
  it("sends the stored bearer token with profile requests", async () => {
    const storage = {
      getItem: () => "jwt-token",
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    vi.stubGlobal("window", { localStorage: storage });
    const getSpy = vi.spyOn(axios, "get").mockResolvedValue({ data: { username: "Test User" } });
    const putSpy = vi.spyOn(axios, "put").mockResolvedValue({ data: { username: "Test User" } });

    await getProfile();
    await saveProfile(emptyProfile);

    expect(getSpy.mock.calls[0][1]).toMatchObject({
      withCredentials: true,
      headers: { Authorization: "Bearer jwt-token" },
    });
    expect(putSpy.mock.calls[0][2]).toMatchObject({
      withCredentials: true,
      headers: { Authorization: "Bearer jwt-token" },
    });
  });
});
