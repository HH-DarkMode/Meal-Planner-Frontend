import "./About.css";

function About() {
  return <main className="about-page">
    <section className="about-hero">
      <span className="about-badge">✦ AI MEAL PLANNER</span>
      <p className="about-eyebrow">ABOUT US</p>
      <h1>Good food makes<br /><span>everyday life easier.</span></h1>
      <p className="about-intro">AI Meal Planner helps you plan meals, track nutrition goals, and find recipes that fit your routine without the unnecessary hassle.</p>
    </section>

    <section className="about-grid">
      <article className="about-card"><span className="about-card-icon">◌</span><h2>Plan clearly</h2><p>Keep today&apos;s meals and the full weekly plan in one place. See quickly what&apos;s next.</p></article>
      <article className="about-card"><span className="about-card-icon">✦</span><h2>Your goals first</h2><p>Your profile helps build nutrition goals and a meal plan that fits you.</p></article>
      <article className="about-card"><span className="about-card-icon">♡</span><h2>A calmer routine</h2><p>When the basics are ready, you have more time to cook and enjoy your food.</p></article>
    </section>

    <section className="contact-section">
      <div className="contact-copy"><p className="about-eyebrow">GET IN TOUCH</p><h2>Have a question?</h2><p>We&apos;d love to hear your feedback and ideas. Send us a message and we&apos;ll get back to you.</p></div>
      <form className="contact-form" action="https://formspree.io/f/xkjgjvay" method="POST">
        <label htmlFor="contact-name">Name<input id="contact-name" name="name" type="text" autoComplete="name" required /></label>
        <label htmlFor="contact-email">Email<input id="contact-email" name="email" type="email" autoComplete="email" required /></label>
        <label htmlFor="contact-message">Message<textarea id="contact-message" name="message" rows={6} required /></label>
        <button className="primary-button" type="submit">Send message</button>
      </form>
    </section>
  </main>;
}

export default About;
