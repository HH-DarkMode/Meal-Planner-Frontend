import { describe, expect, it } from "vitest";
import { emptyProfile, isProfileComplete, type ProfileData } from "./profile";

const completeProfile: ProfileData = {
  ...emptyProfile,
  username: "Test User",
  weight: 75,
  height: 180,
  mealsPerDay: 4,
  gender: "Other",
  goal: "Maintain weight",
  calories: 2400,
  protein: 150,
  fat: 80,
  carbs: 250,
};

describe("isProfileComplete", () => {
  it("rejects a missing profile", () => {
    expect(isProfileComplete(null)).toBe(false);
  });

  it("rejects a profile with missing required information", () => {
    expect(isProfileComplete({ ...completeProfile, goal: "" })).toBe(false);
  });

  it("accepts a profile with all required information", () => {
    expect(isProfileComplete(completeProfile)).toBe(true);
  });
});