import Link from 'next/link';
import styles from './for-companies.module.css';

export const metadata = {
  title: 'For Companies — Synesthetic Minds',
  description:
    'You don\'t need a new system. You need to see what the current one is actually doing.',
};

export default function ForCompaniesPage() {
  return (
    <>
      {/* ---- Hero ---- */}
      <section className="hero">
        <div className="container">
          <div className="label">For existing companies</div>
          <h1>You don&apos;t need a new system. You need to see what the current one is actually doing.</h1>
          <p className="tagline">
            Most organizations have systems that work. The problem is not the system — it&apos;s
            that no one has ever verified whether the output it produces is correct.
          </p>
        </div>
      </section>

      {/* ---- The mechanism ---- */}
      <section>
        <div className="container">
          <div className="label">How it happens</div>
          <h2>The system works. The output is accepted. The gap grows silently.</h2>
          <div className={styles.stepFlow}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>At implementation</h3>
                <p>
                  Something was promised. A spec, a presentation, a conversation. That promise
                  became the belief.
                </p>
              </div>
            </div>
            <div className={styles.stepConnector} />
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Over time</h3>
                <p>
                  The belief became the expectation. No one went back to check whether what was
                  implemented actually matched the promise. The expectation became the reality.
                </p>
              </div>
            </div>
            <div className={styles.stepConnector} />
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Today</h3>
                <p>
                  Decisions are made on system output. That output has never been compared to the
                  original promise. The gap between what people expect and what the system actually
                  produces is invisible.
                </p>
              </div>
            </div>
          </div>
          <div className="callout-amber">
            <p>
              The system doesn&apos;t have to be broken for this to be a problem. It just has to
              be unverified.
            </p>
          </div>
        </div>
      </section>

      {/* ---- What we do ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">The approach</div>
          <h2>We start with what you already have.</h2>
          <p>
            You don&apos;t need to rebuild anything. We work with what your system is already
            producing — runtime data, logs, existing output. We apply Invariant Design to make the
            gap between expectation and reality visible.
          </p>
          <div className={styles.approachSteps}>
            <div className={styles.approachStep}>
              <div className={styles.stepNum}>1</div>
              <div>
                <h3>Define the expectation</h3>
                <p>
                  What do you believe your system produces? We make that belief explicit and
                  testable.
                </p>
              </div>
            </div>
            <div className={styles.approachStep}>
              <div className={styles.stepNum}>2</div>
              <div>
                <h3>Map against reality</h3>
                <p>
                  Using existing log data or runtime monitoring, we compare what the system actually
                  produces against the expectation.
                </p>
              </div>
            </div>
            <div className={styles.approachStep}>
              <div className={styles.stepNum}>3</div>
              <div>
                <h3>Make the gap visible</h3>
                <p>
                  Not as an accusation. As information. Here is what the system promised. Here is
                  what it delivers. Here is the difference.
                </p>
              </div>
            </div>
            <div className={styles.approachStep}>
              <div className={styles.stepNum}>4</div>
              <div>
                <h3>Decide with open eyes</h3>
                <p>
                  Now you can make decisions on a verified foundation. What to fix, what to accept,
                  what to build next.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Where AI fits ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">Then comes AI</div>
          <h2>AI doesn&apos;t replace the verification — it adds a new lens.</h2>
          <p>
            Once you know what your current system is actually doing, AI can be introduced as a tool
            that looks at the same data differently. Not to replace the system, but to surface
            patterns, optimizations, or assessments that the current system can&apos;t produce.
          </p>
          <p>
            Some of those assessments make new choices possible. Others make certain choices
            necessary — because once you can see what you couldn&apos;t see before, you have a
            governance obligation to act on it.
          </p>
          <div className="callout">
            <p>
              This is fundamentally different from selling AI as a solution. We introduce AI as an
              extension of something that already works and is already proven.
            </p>
          </div>
        </div>
      </section>

      {/* ---- What it looks like ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">In practice</div>
          <h2>A conversation first. Then a diagnosis.</h2>
          <p>
            We start with a single question: what decision are you about to make, and what system
            output is it based on? From there, we scope a focused diagnostic — typically a few weeks
            — that produces a clear picture of what your system is actually doing.
          </p>
          <p>
            No large transformation project. No disruption to what&apos;s running. A lens, first.
            Then a decision.
          </p>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="cta-section">
        <div className="container">
          <h2>Start with what you already know.</h2>
          <p>One conversation. No commitment. If it resonates, we&apos;ll take it from there.</p>
          <div className={styles.ctaButtons}>
            <Link href="/contact" className="cta-button">
              Start with a conversation &rarr;
            </Link>
            <Link href="/invariant-design" className="cta-button-outline">
              Learn about Invariant Design &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
