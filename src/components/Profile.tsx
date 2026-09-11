import "./Profile.css";

function Profile() {
  return (
    <div className="profile-page">

      {/* Header */}
      <div className="profile-header">

        <div className="profile-intro">
          <div className="profile-avatar">SF</div>

          <div>
            <div className="profile-label">OMA PROFIILI</div>
            <h1>Hei, Samuel!</h1>
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
            <div className="field-value">
              Samuel Fizum
            </div>
          </div>

          <div className="profile-field">
            <label>Sähköposti</label>
            <div className="field-value">
              samuel.fizum@haha.com
            </div>
          </div>

          <div className="field-row">

            <div className="profile-field">
              <label>Ikä</label>
              <div className="field-value">
                67 vuotta
              </div>
            </div>

            <div className="profile-field">
              <label>Pituus</label>
              <div className="field-value">
                180 cm
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

          <div className="goal-row">
            <span>Nykyinen tavoitteesi</span>
            <strong>Painon ylläpito</strong>
          </div>

          <div className="goal-row">
            <span>Päivittäinen energiatarve</span>
            <strong>2 500 kcal</strong>
          </div>

          <div className="goal-row">
            <span>Ruokavalio</span>
            <strong>Kaikkiruokainen</strong>
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