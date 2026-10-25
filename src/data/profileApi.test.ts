import { afterEach, describe, expect, it, vi } from "vitest";
import { emptyProfile } from "./profile";
import { normalizeProfile } from "./profileApi";

afterEach(() => {
  vi.restoreAllMocks();
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
