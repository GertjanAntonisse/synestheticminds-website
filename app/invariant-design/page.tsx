import Link from 'next/link';
import styles from './invariant-design.module.css';

export const metadata = {
  title: 'Invariant Design — Synesthetic Minds',
  description:
    'Proof of correctness embedded in every system output. Not a dashboard you check separately — proof that travels with the data.',
};

export default function InvariantDesignPage() {
  return (
    <>
      {/* ---- Hero ---- */}
      <section className="hero">
        <div className="container">
          <div className="label">Invariant Design</div>
          <h1>Your system output should carry its own proof of correctness.</h1>
          <p className="tagline">
            Most systems produce output. Invariant Design produces output that proves it is correct
            — at every run, without a separate audit, without a dashboard you have to remember to
            check.
          </p>
        </div>
      </section>

      {/* ---- Recognition ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">The pattern you already know</div>
          <h2>The system worked last time. That doesn&apos;t mean it&apos;s working now.</h2>
          <p>
            Something changed. It might have been a dependency update, a schema migration, a new
            edge case in the data. The system kept running. The output kept arriving. But somewhere
            in the pipeline, the correctness guarantee broke — silently.
          </p>
          <p>
            You found out three weeks later. Or someone in the boardroom found out. Or a customer
            did.
          </p>
          <div className="callout-amber">
            <p>
              The problem is not that systems fail. The problem is that they fail without signaling
              — and decisions accumulate on top of unverified output.
            </p>
          </div>
        </div>
      </section>

      {/* ---- The core ---- */}
      <section>
        <div className="container">
          <div className="label">The core idea</div>
          <h2>Proof travels with the data.</h2>
          <p>
            Every artifact your system produces — a row in a table, a record in a queue, an output
            to a downstream system — carries a structured quality proof alongside it. That proof was
            generated at runtime, against the actual data, using invariants you defined.
          </p>
          <div className={styles.valueChain}>
            <div className={styles.chainItem}>
              <span className={styles.chainLabel}>Promise</span>
            </div>
            <div className={styles.chainArrow}>&rarr;</div>
            <div className={styles.chainItem}>
              <span className={styles.chainLabel}>Invariant</span>
            </div>
            <div className={styles.chainArrow}>&rarr;</div>
            <div className={styles.chainItem}>
              <span className={styles.chainLabel}>Runtime check</span>
            </div>
            <div className={styles.chainArrow}>&rarr;</div>
            <div className={styles.chainItem}>
              <span className={styles.chainLabel}>Signal on the row</span>
            </div>
            <div className={styles.chainArrow}>&rarr;</div>
            <div className={styles.chainItem}>
              <span className={styles.chainLabel}>Decision</span>
            </div>
          </div>
          <p className={styles.chainNote}>
            The audit trail is the data. Not a log file somewhere else. Not a monitoring screen that
            someone needs to open. The proof is attached to the output that carries it.
          </p>
        </div>
      </section>

      {/* ---- Defense rings ---- */}
      <section>
        <div className="container">
          <div className="label">The structure</div>
          <h2>Four defense rings. Each with a distinct function.</h2>
          <div className={styles.ringsGrid}>
            <div className={`${styles.ring} ${styles.ringGreen}`}>
              <div className={styles.ringHeader}>
                <span className={styles.ringBadge}>Inner ring</span>
                <span className={styles.ringAction}>Prevent</span>
              </div>
              <h3>Hard rules that stop incorrect state before it lands</h3>
              <p>
                The innermost ring catches violations before they enter the system. Constraints that
                cannot be bypassed. Incorrect state never lands in your data.
              </p>
            </div>
            <div className={`${styles.ring} ${styles.ringBlue}`}>
              <div className={styles.ringHeader}>
                <span className={styles.ringBadge}>Second ring</span>
                <span className={styles.ringAction}>Prove</span>
              </div>
              <h3>Proof that core product flows still work as intended</h3>
              <p>
                Invariants that cover your most important flows. Every run produces a signed
                confirmation that the critical path executed correctly — or a clear signal that it
                did not.
              </p>
            </div>
            <div className={`${styles.ring} ${styles.ringAmber}`}>
              <div className={styles.ringHeader}>
                <span className={styles.ringBadge}>Third ring</span>
                <span className={styles.ringAction}>Remember</span>
              </div>
              <h3>Memory of the system</h3>
              <p>
                Previously understood failures become permanently replayable. Once you have seen a
                failure, the system remembers it. That failure can never silently recur.
              </p>
            </div>
            <div className={`${styles.ring} ${styles.ringPlum}`}>
              <div className={styles.ringHeader}>
                <span className={styles.ringBadge}>Outer ring</span>
                <span className={styles.ringAction}>Decide</span>
              </div>
              <h3>Translate technical proof into a release decision</h3>
              <p>
                The outermost ring converts the output of the other three into a binary: ship or
                block. The decision is made by evidence, not intuition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- 4-step approach ---- */}
      <section>
        <div className="container">
          <div className="label">How it works</div>
          <h2>Four steps from promise to decision.</h2>
          <div className={styles.stepsRow}>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>1</div>
              <h3>Formulate</h3>
              <p>
                Define what must always be true about your system&apos;s output. These are your
                invariants — not tests, but permanent contracts.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>2</div>
              <h3>Generate</h3>
              <p>
                At each run, the system generates structured proof artifacts against the invariants
                you defined.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>3</div>
              <h3>Compare</h3>
              <p>
                Proof from this run is compared to the baseline. Deviations surface immediately, at
                the row level.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>4</div>
              <h3>Decide</h3>
              <p>
                Pass or block. The release decision is made by the evidence — not by the confidence
                of the team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Where applied ---- */}
      <section>
        <div className="container">
          <div className="label">Proven in practice</div>
          <h2>Applied in live production environments.</h2>
          <div className={styles.projectGrid}>
            {['ThreadC', 'TrackAndBack', 'SessionMCP', 'Tradeflow'].map((name) => (
              <div key={name} className={styles.projectTag}>
                {name}
              </div>
            ))}
          </div>
          <p className={styles.projectNote}>
            Invariant Design is not a theoretical framework. It runs in production pipelines where
            incorrect output has real consequences.
          </p>
        </div>
      </section>

      {/* ---- Origin proof card ---- */}
      <section>
        <div className="container">
          <div className={styles.proofCard}>
            <div className="label">The numbers</div>
            <h2>What Invariant Design produces</h2>
            <div className={styles.proofStats}>
              <div className={styles.proofStat}>
                <span className={styles.statNum}>7</span>
                <span className={styles.statLabel}>invariant types</span>
              </div>
              <div className={styles.proofStat}>
                <span className={styles.statNum}>4</span>
                <span className={styles.statLabel}>defense rings</span>
              </div>
              <div className={styles.proofStat}>
                <span className={styles.statNum}>5</span>
                <span className={styles.statLabel}>pipeline stages</span>
              </div>
            </div>
            <p className={styles.proofDesc}>
              Each invariant type covers a distinct category of correctness. Together they span the
              full surface area from data integrity to behavioral correctness to provenance tracking.
            </p>
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="cta-section">
        <div className="container">
          <h2>Want to build systems that prove their own correctness?</h2>
          <p>Connect with René directly — or explore how this applies to your existing systems.</p>
          <div className={styles.ctaButtons}>
            <a
              href="https://www.linkedin.com/in/reneluijk/"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button"
            >
              Connect with René &rarr;
            </a>
            <Link href="/for-companies" className="cta-button-outline">
              For existing companies &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
