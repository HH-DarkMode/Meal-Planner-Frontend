import "./Profile.css";
import { useMemo, useState } from "react";

const goals = [
  { id: "aggressive-bulk", label: "Aggressive bulk", adjustment: 1.2 },
  { id: "bulk", label: "Bulk", adjustment: 1.1 },
  { id: "healthy", label: "Terveellinen ruokavalio", adjustment: 1 },
  { id: "cut", label: "Cut", adjustment: 0.85 },
  { id: "aggressive-cut", label: "Aggressive cut", adjustment: 0.75 },
];

function Profile() {
  const [username, setUsername] = useState("Samuel");
  const [weight, setWeight] = useState("80");
  const [gender, setGender] = useState("mies");
  const [height, setHeight] = useState("180");
  const [selectedGoal, setSelectedGoal] = useState("healthy");

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

  const initials = username.trim().slice(0, 2).toUpperCase() || "??";
  const activeGoal = goals.find((goal) => goal.id === selectedGoal) ?? goals[2];

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

        <button className="save-button">
          Tallenna muutokset
        </button>

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
            <label>Nimi</label>
            <input className="field-value field-input" value={username} onChange={(event) => setUsername(event.target.value)} />
          </div>

          <div className="profile-field">
            <label>Paino</label>
            <div className="input-with-unit">
              <input className="field-value field-input" type="number" min="30" max="300" value={weight} onChange={(event) => setWeight(event.target.value)} />
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
                <input className="field-value field-input" type="number" min="120" max="230" value={height} onChange={(event) => setHeight(event.target.value)} />
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
                <input type="checkbox" checked={selectedGoal === goal.id} onChange={() => setSelectedGoal(goal.id)} />
                <span>{goal.label}</span>
              </label>
            ))}
          </div>

          <div className="goal-summary">
            <div className="goal-summary-heading">
              <span>Valittu tavoite</span>
              <strong>{activeGoal.label}</strong>
            </div>
            <div className="macro-grid">
              <div><strong>{nutrition.calories}</strong><span>kcal / päivä</span></div>
              <div><strong>{nutrition.protein} g</strong><span>proteiini</span></div>
              <div><strong>{nutrition.fat} g</strong><span>rasva</span></div>
              <div><strong>{nutrition.carbs} g</strong><span>hiilarit</span></div>
            </div>
            <p className="estimate-note">Arvio perustuu tietoihisi ja aktiivisuuskertoimeen 1,4.</p>
          </div>

          <button className="edit-goals-button">
            Muokkaa tavoitteita
          </button>

        </div>

      </div>

    </div>
  );
}

export default Profile;