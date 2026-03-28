import Link from 'next/link';
import styles from './home.module.css';

export default function HomePage() {
  return (
    <>
      {/* ---- Hero ---- */}
      <section className="hero">
        <div className="container">
          <div className="label">The question no one asks</div>
          <h1>Your systems run. But do they do what you think they do?</h1>
          <p className="tagline">
            Every organization steers on system output. Most have never verified if that output is
            correct. Not because they don&apos;t care — but because no one ever built them the
            instrument to check.
          </p>
        </div>
      </section>

      {/* ---- Three unknowns ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">Where decisions go wrong</div>
          <h2>What was promised. What is expected. What actually happens.</h2>
          <p>
            Most organizations have never put these three side by side. What was promised at
            implementation has become what people assume the system does. What the system actually
            produces — that&apos;s a third thing no one has compared to the other two.
          </p>
          <p>
            That gap is where the silent error lives. Not a crash. Not an alert. Just decisions made
            on output that has never been verified.
          </p>
          <div className="callout">
            <p>
              The moment that matters is not when something breaks. It is when someone in the
              boardroom asks: &ldquo;But do we know if this is right?&rdquo; — and no one can
              answer.
            </p>
          </div>
        </div>
      </section>

      {/* ---- What we do ---- */}
      <section>
        <div className="container">
          <div className="label">The Synesthetic Minds approach</div>
          <h2>We make visible what your systems are actually doing.</h2>
          <div className={styles.cardGrid}>
            <div className={styles.approachCard}>
              <div className={styles.cardLabel}>Gertjan Antonisse</div>
              <h3>Understand before you hand over</h3>
              <p>
                Before anything is automated, we map what the system actually does — not what it was
                designed to do. The gap between those two is where AI fails.
              </p>
            </div>
            <div className={styles.approachCard}>
              <div className={styles.cardLabel}>René Luijk</div>
              <h3>Prove it at every run</h3>
              <p>
                Invariant Design embeds proof of correctness into your system output. Not a dashboard
                you check separately. Proof that travels with the data.
              </p>
            </div>
          </div>
          <p className={styles.belowCards}>
            Together, this creates something most organizations have never had: a system they can
            actually trust — not because it hasn&apos;t failed yet, but because it proves its own
            behavior.
          </p>
        </div>
      </section>

      {/* ---- Two paths ---- */}
      <section>
        <div className="container">
          <div className="label">How we work</div>
          <h2>Whether you&apos;re building now or already running.</h2>
          <div className={styles.pathGrid}>
            <Link href="/for-companies" className={styles.pathCard}>
              <div className={styles.pathCardLabel}>Existing companies</div>
              <h3>Your systems are already running. Do you trust them?</h3>
              <p>
                We put a lens on what your current systems are producing — through runtime data or
                logs — and make visible whether the output matches what you believe it does.
              </p>
              <span className={styles.arrow}>Explore this path &rarr;</span>
            </Link>
            <Link href="/invariant-design" className={styles.pathCard}>
              <div className={styles.pathCardLabel}>Startups &amp; builders</div>
              <h3>Build provability in from day one.</h3>
              <p>
                If you&apos;re building now, Invariant Design lets you ship fast without losing the
                ability to prove that what you shipped is correct.
              </p>
              <span className={styles.arrow}>Learn Invariant Design &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ---- The moment to start ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">When to call us</div>
          <h2>Right before a consequential decision.</h2>
          <p>
            Not after the system has failed. Not when the project is already over. The right moment
            is when a significant decision is about to be made based on system output — and someone
            in the room isn&apos;t sure the foundation is solid.
          </p>
          <p>That&apos;s the question we help you answer before you commit.</p>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="cta-section">
        <div className="container">
          <h2>Does the picture you have of your systems match what they actually do?</h2>
          <p>That&apos;s the question we ask before we start.</p>
          <Link href="/contact" className="cta-button">
            Start the conversation &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}
