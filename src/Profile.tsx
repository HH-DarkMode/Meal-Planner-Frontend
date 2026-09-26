import "./Profile.css";
import { useEffect, useMemo, useState } from "react";
import { type ProfileData } from "./data/profile";
import { getProfile, saveProfile as persistProfile } from "./data/profileApi";

const goals = [
  { id: "aggressive-bulk", label: "Aggressive bulk", adjustment: 1.2 },
  { id: "bulk", label: "Bulk", adjustment: 1.1 },
  { id: "healthy", label: "Healthy diet", adjustment: 1 },
  { id: "cut", label: "Cut", adjustment: 0.85 },
  { id: "aggressive-cut", label: "Aggressive cut", adjustment: 0.75 },
];

const dietaryOptions = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "dairy-free", label: "Dairy-free" },
  { id: "high-protein", label: "High protein" },
  { id: "low-carb", label: "Low carb" },
];

const goalDescriptions: Record<string, string> = {
  "aggressive-bulk": "Aggressive bulk adds calories and energy quickly to support maximum muscle growth.",
  bulk: "Bulk supports more gradual muscle growth with slightly more energy than a maintenance diet.",
  healthy: "A healthy diet is a balanced choice that keeps protein, fat, and carbs at moderate levels.",
  cut: "Cut reduces calories to support fat loss while preserving muscle mass.",
  "aggressive-cut": "Aggressive cut is a stronger cutting phase with lower calories and tighter control.",
};

const dietDescriptions: Record<string, string> = {
  vegetarian: "Vegetarian means eating plant-based foods without meat or fish.",
  vegan: "Vegan means avoiding all animal products, such as milk, eggs, and honey.",
  "gluten-free": "Gluten-free means avoiding gluten from wheat, oats, and barley.",
  "dairy-free": "Dairy-free means avoiding milk and products such as cheese and cream.",
  "high-protein": "High protein increases the share of protein to help you feel stronger and fuller.",
  "low-carb": "Low carb reduces carbohydrates and focuses more on protein and fats.",
};

function Profile({ profile: initialProfile, onProfileSaved }: { profile: ProfileData | null; onProfileSaved: (profile: ProfileData) => void }) {
  const [username, setUsername] = useState(initialProfile?.username ?? "");
  const [weight, setWeight] = useState(initialProfile?.weight === null || initialProfile?.weight === undefined ? "" : String(initialProfile.weight));
  const [gender, setGender] = useState(initialProfile?.gender ?? "");
  const [height, setHeight] = useState(initialProfile?.height === null || initialProfile?.height === undefined ? "" : String(initialProfile.height));
  const [mealsPerDay, setMealsPerDay] = useState(initialProfile?.mealsPerDay === null || initialProfile?.mealsPerDay === undefined ? "" : String(initialProfile.mealsPerDay));
  const [selectedGoal, setSelectedGoal] = useState(initialProfile?.goal ?? "");
  const [selectedDiets, setSelectedDiets] = useState<string[]>(initialProfile?.diets ?? []);
  const [focusedDiet, setFocusedDiet] = useState<string>(initialProfile?.diets[0] ?? "");
  const [customNutrition, setCustomNutrition] = useState<{
    calories: string;
    protein: string;
    fat: string;
    carbs: string;
  } | null>(initialProfile?.calories === null || initialProfile?.calories === undefined ? null : {
    calories: String(initialProfile.calories),
    protein: String(initialProfile.protein ?? ""),
    fat: String(initialProfile.fat ?? ""),
    carbs: String(initialProfile.carbs ?? ""),
  });
  const [isLoading, setIsLoading] = useState(!initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (initialProfile) {
      return;
    }

    getProfile()
      .then((profile) => {
        setUsername(profile.username);
        setWeight(String(profile.weight));
        setHeight(String(profile.height));
        setMealsPerDay(profile.mealsPerDay === null || profile.mealsPerDay === undefined ? "" : String(profile.mealsPerDay));
        setGender(profile.gender);
        setSelectedGoal(profile.goal);
        setSelectedDiets(profile.diets ?? []);
        if (profile.calories !== undefined && profile.calories !== null) {
          setCustomNutrition({
            calories: String(profile.calories),
            protein: String(profile.protein),
            fat: String(profile.fat),
            carbs: String(profile.carbs),
          });
        }
      })
      .catch(() => setMessage("The backend is not running."))
      .finally(() => setIsLoading(false));
  }, [initialProfile]);

  const nutrition = useMemo(() => {
    if (!weight || !height || !gender) {
      return { calories: 0, protein: 0, fat: 0, carbs: 0 };
    }

    const currentGoal = goals.find((goal) => goal.id === selectedGoal) ?? { adjustment: 1 };
    const numericWeight = Number(weight) || 0;
    const numericHeight = Number(height) || 0;
    const baseCalories = 10 * numericWeight + 6.25 * numericHeight + (gender === "mies" ? 5 : -161);
    const calories = Math.round((baseCalories * 1.4 * currentGoal.adjustment) / 50) * 50;
    const protein = Math.round(numericWeight * (selectedGoal.includes("bulk") ? 1.8 : 2));
    const fat = Math.round(numericWeight * 0.8);
    const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

    return { calories, protein, fat, carbs };
  }, [gender, height, selectedGoal, weight]);

  const effectiveNutrition = customNutrition
    ? {
        calories: Number(customNutrition.calories) || 0,
        protein: Number(customNutrition.protein) || 0,
        fat: Number(customNutrition.fat) || 0,
        carbs: Number(customNutrition.carbs) || 0,
      }
    : nutrition;

  const initials = username.trim().slice(0, 2).toUpperCase() || "??";
  const activeGoal = goals.find((goal) => goal.id === selectedGoal);

  const toggleDiet = (dietId: string) => {
    setSelectedDiets((current) => {
      const nextSelection = current.includes(dietId)
        ? current.filter((diet) => diet !== dietId)
        : [...current, dietId];

      if (nextSelection.length > 0) {
        setFocusedDiet(dietId);
      }

      return nextSelection;
    });
  };

  const selectedDietLabels = dietaryOptions
    .filter((diet) => selectedDiets.includes(diet.id))
    .map((diet) => diet.label);

  const activeGoalDescription = selectedGoal ? goalDescriptions[selectedGoal] : "Select a goal to see its description.";
  const activeDietDescription = selectedDiets.length > 0
    ? dietDescriptions[focusedDiet] ?? dietDescriptions.vegetarian
    : "";

  const recipePreferenceSummary =
    selectedDietLabels.length > 0
      ? selectedDietLabels.join(", ")
      : "No dietary preferences";

  const updateCustomNutrition = (field: keyof NonNullable<typeof customNutrition>, value: string) => {
    setCustomNutrition((current) => ({
      calories: current?.calories ?? String(nutrition.calories),
      protein: current?.protein ?? String(nutrition.protein),
      fat: current?.fat ?? String(nutrition.fat),
      carbs: current?.carbs ?? String(nutrition.carbs),
      [field]: value,
    }));
  };

  const saveProfile = async () => {
    setIsSaving(true);
    setMessage("");

    try {
      const savedProfile = await persistProfile({
        username,
        weight: Number(weight),
        height: Number(height),
        mealsPerDay: mealsPerDay ? Number(mealsPerDay) : null,
        gender,
        goal: selectedGoal,
        diets: selectedDiets,
        calories: effectiveNutrition.calories,
        protein: effectiveNutrition.protein,
        fat: effectiveNutrition.fat,
        carbs: effectiveNutrition.carbs,
      });
      onProfileSaved(savedProfile);
      setMessage("Changes saved.");
    } catch {
      setMessage("Saving failed. Start the backend on port 8080.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-page">

      {/* Header */}
      <div className="profile-header">

        <div className="profile-intro">
          <div className="profile-avatar">{initials}</div>

          <div>
            <div className="profile-label">MY PROFILE</div>
            <h1>Hello, {username || "there"}!</h1>
            <p>
              Keep your goals and preferences up to date for recommendations that fit you.
            </p>
          </div>
        </div>

        <button className="save-button" onClick={saveProfile} disabled={isLoading || isSaving}>
          {isSaving ? "Saving..." : "Save changes"}
        </button>

        {message && <p className="save-message" role="status">{message}</p>}

      </div>

      {/* Cards */}
      <div className="profile-cards">

        {/* Personal information */}
        <div className="profile-card">

          <div className="card-heading">
            <div>
              <span className="card-label">PERSONAL DETAILS</span>
              <h2>My details</h2>
            </div>

            <span className="card-icon">✎</span>
          </div>

          <div className="profile-field">
            <label>Username</label>
            <input className="field-value field-input" placeholder="e.g. Alex" value={username} onChange={(event) => setUsername(event.target.value)} />
          </div>

          <div className="profile-field">
            <label>Weight</label>
            <div className="input-with-unit">
              <input className="field-value field-input" type="number" min="30" max="300" placeholder="Esim. 80" value={weight} onChange={(event) => setWeight(event.target.value)} />
              <span>kg</span>
            </div>
          </div>

          <div className="profile-field">
            <label>Meals per day</label>
            <div className="input-with-unit">
              <input className="field-value field-input" type="number" min="1" max="8" placeholder="e.g. 4" value={mealsPerDay} onChange={(event) => setMealsPerDay(event.target.value)} />
              <span>meals</span>
            </div>
          </div>

          <div className="field-row">

            <div className="profile-field">
              <label>Gender</label>
              <select className="field-value field-input" value={gender} onChange={(event) => setGender(event.target.value)}>
                <option value="">Select gender</option>
                <option value="mies">Male</option>
                <option value="nainen">Female</option>
              </select>
            </div>

            <div className="profile-field">
              <label>Height</label>
              <div className="input-with-unit">
                <input className="field-value field-input" type="number" min="120" max="230" placeholder="Esim. 180" value={height} onChange={(event) => setHeight(event.target.value)} />
                <span>cm</span>
              </div>
            </div>

          </div>

        </div>

        {/* Goals */}
        <div className="profile-card">

          <div className="card-heading">
            <div>
              <span className="card-label">GOALS</span>
              <h2>Your wellbeing</h2>
            </div>

            <span className="card-icon">♥</span>
          </div>

          <div className="goal-options">
            {goals.map((goal) => (
              <label className={`goal-option ${selectedGoal === goal.id ? "is-selected" : ""}`} key={goal.id}>
                <input
                  type="checkbox"
                  checked={selectedGoal === goal.id}
                  onChange={() => setSelectedGoal(goal.id)}
                />
                <span>{goal.label}</span>
              </label>
            ))}
          </div>

          <div className="selection-detail-box">
            <div className="selection-detail-label">Selected goal</div>
            <div className="selection-detail-title">{activeGoal?.label ?? "No goal selected"}</div>
            <p>{activeGoalDescription}</p>
          </div>

          <div className="diet-options">
            {dietaryOptions.map((diet) => (
              <label className={`diet-option ${selectedDiets.includes(diet.id) ? "is-selected" : ""}`} key={diet.id}>
                <input
                  type="checkbox"
                  checked={selectedDiets.includes(diet.id)}
                  onChange={() => toggleDiet(diet.id)}
                />
                <span>{diet.label}</span>
              </label>
            ))}
          </div>

          {selectedDiets.length > 0 && (
            <div className="selection-detail-box">
              <div className="selection-detail-label">Selected diet</div>
              <div className="selection-detail-title">{dietaryOptions.find((diet) => diet.id === focusedDiet)?.label ?? "Vegetarian"}</div>
              <p>{activeDietDescription}</p>
            </div>
          )}

          <div className="goal-summary">
            <div className="goal-summary-heading">
                <span>Nutrition target</span>
            </div>
            <div className="macro-grid">
              <label className="macro-box">
                <input
                  type="number"
                  min="0"
                  value={customNutrition?.calories ?? effectiveNutrition.calories}
                  onChange={(event) => updateCustomNutrition("calories", event.target.value)}
                />
                <span>kcal / day</span>
              </label>

              <label className="macro-box">
                <input
                  type="number"
                  min="0"
                  value={customNutrition?.protein ?? effectiveNutrition.protein}
                  onChange={(event) => updateCustomNutrition("protein", event.target.value)}
                />
                <span>protein</span>
              </label>

              <label className="macro-box">
                <input
                  type="number"
                  min="0"
                  value={customNutrition?.fat ?? effectiveNutrition.fat}
                  onChange={(event) => updateCustomNutrition("fat", event.target.value)}
                />
                <span>fat</span>
              </label>

              <label className="macro-box">
                <input
                  type="number"
                  min="0"
                  value={customNutrition?.carbs ?? effectiveNutrition.carbs}
                  onChange={(event) => updateCustomNutrition("carbs", event.target.value)}
                />
                <span>carbs</span>
              </label>
            </div>
            <p className="estimate-note">This estimate is based on your details and an activity factor of 1.4.</p>
          </div>

          {selectedDiets.length > 0 && (
            <div className="recipe-impact">
              <div className="goal-summary-heading">
                <span>Recipe preferences</span>
                <strong>Active</strong>
              </div>
              <div className="diet-tag-list">
                {selectedDietLabels.map((label) => (
                  <span className="diet-tag" key={label}>{label}</span>
                ))}
              </div>
              <p className="estimate-note">
                Future recipe recommendations will consider these preferences: {recipePreferenceSummary}.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Profile;