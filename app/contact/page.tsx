import styles from './contact.module.css';

export const metadata = {
  title: 'Contact — Synesthetic Minds',
  description:
    'One question. No commitment. If it resonates, we\'ll take it from there.',
};

export default function ContactPage() {
  return (
    <>
      {/* ---- Hero ---- */}
      <section className="hero">
        <div className="container">
          <div className="label">Start here</div>
          <h1>Does the picture match the reality?</h1>
          <p className="tagline">
            One question. No commitment. If it resonates, we&apos;ll take it from there.
          </p>
        </div>
      </section>

      {/* ---- Contact cards ---- */}
      <section>
        <div className="container">
          <div className={styles.contactCards}>
            <div className={styles.contactCard}>
              <div className={styles.contactLabel}>Systems understanding &middot; Track 2</div>
              <h2>Gertjan Antonisse</h2>
              <p>
                For conversations about existing systems, the decision crossroads, and what your
                current output is actually telling you. Gertjan brings systems thinking and
                organizational experience to make visible what was never made explicit.
              </p>
              <a
                href="https://www.linkedin.com/in/gertjan-antonisse/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkedinButton}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Connect on LinkedIn
              </a>
            </div>
            <div className={styles.contactCard}>
              <div className={styles.contactLabel}>Invariant Design &middot; Track 1</div>
              <h2>René Luijk</h2>
              <p>
                For conversations about building provability into new systems, or retrofitting
                runtime signals onto existing ones. René builds the technical infrastructure that
                lets systems prove their own correctness at every run.
              </p>
              <a
                href="https://www.linkedin.com/in/reneluijk/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkedinButton}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---- What to expect ---- */}
      <section>
        <div className="container">
          <h2>What to expect from the first conversation.</h2>
          <div className={styles.expectList}>
            <div className={styles.expectItem}>
              <div className={styles.expectNum}>1</div>
              <p>
                We ask one question: what decision are you about to make, and on what basis?
              </p>
            </div>
            <div className={styles.expectItem}>
              <div className={styles.expectNum}>2</div>
              <p>
                We listen for where the gap between expectation and reality might be.
              </p>
            </div>
            <div className={styles.expectItem}>
              <div className={styles.expectNum}>3</div>
              <p>
                If there&apos;s a fit, we propose a focused diagnostic. If not, we&apos;ll say so.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
