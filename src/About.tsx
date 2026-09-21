import "./About.css";

function About() {
  return <main className="about-page">
    <section className="about-hero">
      <span className="about-badge">✦ AI MEAL PLANNER</span>
      <p className="about-eyebrow">TIETOA MEISTÄ</p>
      <h1>Hyvä ruoka tekee<br /><span>arjesta helpompaa.</span></h1>
      <p className="about-intro">AI Meal Planner auttaa suunnittelemaan ateriat, seuraamaan ravintotavoitteita ja löytämään arkeen sopivia reseptejä ilman turhaa säätöä.</p>
    </section>

    <section className="about-grid">
      <article className="about-card"><span className="about-card-icon">◌</span><h2>Suunnittele selkeästi</h2><p>Pidä päivän ateriat ja koko viikon suunnitelma yhdessä paikassa. Näet nopeasti mitä syöt seuraavaksi.</p></article>
      <article className="about-card"><span className="about-card-icon">✦</span><h2>Tavoitteesi edellä</h2><p>Profiilisi auttaa rakentamaan ravintotavoitteet ja ruokavalion juuri sinulle sopiviksi.</p></article>
      <article className="about-card"><span className="about-card-icon">♡</span><h2>Rennompi arki</h2><p>Kun perusasiat ovat valmiina, aikaa jää enemmän ruoanlaittoon ja siitä nauttimiseen.</p></article>
    </section>

    <section className="contact-section">
      <div className="contact-copy"><p className="about-eyebrow">OTA YHTEYTTÄ</p><h2>Onko sinulla kysyttävää?</h2><p>Kuulemme mielellämme palautetta ja kehitysideoita. Lähetä viesti, niin palaamme asiaan.</p></div>
      <form className="contact-form" action="https://formspree.io/f/xkjgjvay" method="POST">
        <label htmlFor="contact-name">Nimi<input id="contact-name" name="name" type="text" autoComplete="name" required /></label>
        <label htmlFor="contact-email">Sähköposti<input id="contact-email" name="email" type="email" autoComplete="email" required /></label>
        <label htmlFor="contact-message">Viesti<textarea id="contact-message" name="message" rows={6} required /></label>
        <button className="primary-button" type="submit">Lähetä viesti</button>
      </form>
    </section>
  </main>;
}

export default About;
