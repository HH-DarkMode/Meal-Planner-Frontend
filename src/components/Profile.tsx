import "./Profile.css";
import { useEffect, useMemo, useState } from "react";

const profileApi = "/api/profile";

const goals = [
  { id: "aggressive-bulk", label: "Aggressive bulk", adjustment: 1.2 },
  { id: "bulk", label: "Bulk", adjustment: 1.1 },
  { id: "healthy", label: "Terveellinen ruokavalio", adjustment: 1 },
  { id: "cut", label: "Cut", adjustment: 0.85 },
  { id: "aggressive-cut", label: "Aggressive cut", adjustment: 0.75 },
];

const dietaryOptions = [
  { id: "vegetarian", label: "Kasvissyöjä" },
  { id: "vegan", label: "Vegaani" },
  { id: "gluten-free", label: "Gluteeniton" },
  { id: "dairy-free", label: "Laktoositon" },
  { id: "high-protein", label: "Korkea proteiini" },
  { id: "low-carb", label: "Matala hiilihydraatti" },
];

const goalDescriptions: Record<string, string> = {
  "aggressive-bulk": "Aggressive bulk lisää kaloreita ja energiaa nopeasti, jotta lihasmassa kasvaa mahdollisimman tehokkaasti.",
  bulk: "Bulk tukee maltillisempaa lihaskasvua ja antaa hieman enemmän energiaa kuin perusruokavalio.",
  healthy: "Terveellinen ruokavalio on tasapainoinen valinta, joka pitää proteiinin, rasvan ja hiilihydraatit kohtuullisella tasolla.",
  cut: "Cut vähentää kaloreita ja auttaa laihtumisessa säilyttäen lihasmassan.",
  "aggressive-cut": "Aggressive cut on voimakkaampi leikkausvaihe, jossa kalorit ovat alhaisemmat ja ruokavalio on tarkemmin kontrolloitu.",
};

const dietDescriptions: Record<string, string> = {
  vegetarian: "Kasvissyöjä tarkoittaa, että syöt kasvikunnan tuotteita, mutta et käytä lihaa tai kalaa.",
  vegan: "Vegaani tarkoittaa, että et käytä mitään eläinperäisiä tuotteita, kuten maitoa, kananmunia tai hunajaa.",
  "gluten-free": "Gluteeniton tarkoittaa, että vältät vehnä-, kaura- ja ohrajuuresta tulevaa gluteenia.",
  "dairy-free": "Laktoositon tarkoittaa, että vältät maitoa ja sen tuotteita, kuten juustoa ja kermaa.",
  "high-protein": "Korkea proteiini lisää proteiinin osuutta, jotta olet vahvempi ja täyttävämpi.",
  "low-carb": "Matala hiilihydraatti vähentää hiilihydraattien määrää ja keskittyy enemmän proteiiniin ja rasvoihin.",
};

function Profile() {
  const [username, setUsername] = useState("Samuel");
  const [weight, setWeight] = useState("80");
  const [gender, setGender] = useState("mies");
  const [height, setHeight] = useState("180");
  const [selectedGoal, setSelectedGoal] = useState("healthy");
  const [selectedDiets, setSelectedDiets] = useState<string[]>(["vegetarian"]);
  const [focusedDiet, setFocusedDiet] = useState<string>("vegetarian");
  const [customNutrition, setCustomNutrition] = useState<{
    calories: string;
    protein: string;
    fat: string;
    carbs: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(profileApi)
      .then((response) => {
        if (!response.ok) throw new Error("Profile loading failed");
        return response.json();
      })
      .then((profile) => {
        setUsername(profile.username);
        setWeight(String(profile.weight));
        setHeight(String(profile.height));
        setGender(profile.gender);
        setSelectedGoal(profile.goal);
        setSelectedDiets(profile.diets ?? []);
        if (profile.calories !== undefined) {
          setCustomNutrition({
            calories: String(profile.calories),
            protein: String(profile.protein),
            fat: String(profile.fat),
            carbs: String(profile.carbs),
          });
        }
      })
      .catch(() => setMessage("Backend ei ole käynnissä."))
      .finally(() => setIsLoading(false));
  }, []);

  const nutrition = useMemo(() => {
    const currentGoal = goals.find((goal) => goal.id === selectedGoal) ?? goals[2];
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
  const activeGoal = goals.find((goal) => goal.id === selectedGoal) ?? goals[2];

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

  const activeGoalDescription = goalDescriptions[selectedGoal] ?? goalDescriptions.healthy;
  const activeDietDescription = selectedDiets.length > 0
    ? dietDescriptions[focusedDiet] ?? dietDescriptions.vegetarian
    : "";

  const recipePreferenceSummary =
    selectedDietLabels.length > 0
      ? selectedDietLabels.join(", ")
      : "Ei erikoisruokavalioita";

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
      const response = await fetch(profileApi, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          weight: Number(weight),
          height: Number(height),
          gender,
          goal: selectedGoal,
          diets: selectedDiets,
          calories: effectiveNutrition.calories,
          protein: effectiveNutrition.protein,
          fat: effectiveNutrition.fat,
          carbs: effectiveNutrition.carbs,
        }),
      });

      if (!response.ok) throw new Error("Profile saving failed");
      setMessage("Muutokset tallennettu.");
    } catch {
      setMessage("Tallennus epäonnistui. Käynnistä backend porttiin 8080.");
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
            <div className="profile-label">OMA PROFIILI</div>
            <h1>Hei, {username || "sinä"}!</h1>
            <p>
              Pidä tavoitteesi ja mieltymyksesi ajan tasalla, niin saat juuri
              sinulle sopivia suosituksia.
            </p>
          </div>
        </div>

        <button className="save-button" onClick={saveProfile} disabled={isLoading || isSaving}>
          {isSaving ? "Tallennetaan..." : "Tallenna muutokset"}
        </button>

        {message && <p className="save-message" role="status">{message}</p>}

      </div>

      {/* Cards */}
      <div className="profile-cards">

        {/* Personal information */}
        <div className="profile-card">

          <div className="card-heading">
            <div>
              <span className="card-label">PERUSTIEDOT</span>
              <h2>Minun tietoni</h2>
            </div>

            <span className="card-icon">✎</span>
          </div>

          <div className="profile-field">
            <label>Käyttäjänimi</label>
            <input className="field-value field-input" placeholder="Esim. fitness haukka" value={username} onChange={(event) => setUsername(event.target.value)} />
          </div>

          <div className="profile-field">
            <label>Paino</label>
            <div className="input-with-unit">
              <input className="field-value field-input" type="number" min="30" max="300" placeholder="Esim. 80" value={weight} onChange={(event) => setWeight(event.target.value)} />
              <span>kg</span>
            </div>
          </div>

          <div className="field-row">

            <div className="profile-field">
              <label>Sukupuoli</label>
              <select className="field-value field-input" value={gender} onChange={(event) => setGender(event.target.value)}>
                <option value="mies">Mies</option>
                <option value="nainen">Nainen</option>
              </select>
            </div>

            <div className="profile-field">
              <label>Pituus</label>
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
              <span className="card-label">TAVOITTEET</span>
              <h2>Hyvinvointisi</h2>
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
            <div className="selection-detail-label">Valittu tavoite</div>
            <div className="selection-detail-title">{activeGoal.label}</div>
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
              <div className="selection-detail-label">Valittu ruokavalio</div>
              <div className="selection-detail-title">{dietaryOptions.find((diet) => diet.id === focusedDiet)?.label ?? "Kasvissyöjä"}</div>
              <p>{activeDietDescription}</p>
            </div>
          )}

          <div className="goal-summary">
            <div className="goal-summary-heading">
              <span>Ravintotavoite</span>
            </div>
            <div className="macro-grid">
              <label className="macro-box">
                <input
                  type="number"
                  min="0"
                  value={customNutrition?.calories ?? effectiveNutrition.calories}
                  onChange={(event) => updateCustomNutrition("calories", event.target.value)}
                />
                <span>kcal / päivä</span>
              </label>

              <label className="macro-box">
                <input
                  type="number"
                  min="0"
                  value={customNutrition?.protein ?? effectiveNutrition.protein}
                  onChange={(event) => updateCustomNutrition("protein", event.target.value)}
                />
                <span>proteiini</span>
              </label>

              <label className="macro-box">
                <input
                  type="number"
                  min="0"
                  value={customNutrition?.fat ?? effectiveNutrition.fat}
                  onChange={(event) => updateCustomNutrition("fat", event.target.value)}
                />
                <span>rasva</span>
              </label>

              <label className="macro-box">
                <input
                  type="number"
                  min="0"
                  value={customNutrition?.carbs ?? effectiveNutrition.carbs}
                  onChange={(event) => updateCustomNutrition("carbs", event.target.value)}
                />
                <span>hiilarit</span>
              </label>
            </div>
            <p className="estimate-note">Arvio perustuu tietoihisi ja aktiivisuuskertoimeen 1,4.</p>
          </div>

          {selectedDiets.length > 0 && (
            <div className="recipe-impact">
              <div className="goal-summary-heading">
                <span>Reseptien huomioiminen</span>
                <strong>Aktivoi</strong>
              </div>
              <div className="diet-tag-list">
                {selectedDietLabels.map((label) => (
                  <span className="diet-tag" key={label}>{label}</span>
                ))}
              </div>
              <p className="estimate-note">
                Reseptisuositukset huomioivat nämä valinnat myöhemmin: {recipePreferenceSummary}.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Profile;