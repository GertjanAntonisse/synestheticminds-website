import Link from 'next/link';
import styles from './in-practice.module.css';

export const metadata = {
  title: 'Invariants in Practice — Synesthetic Minds',
  description:
    'Invariants grow with your system. From designed upfront to discovered through incidents — and from deploy gates to runtime signals.',
};

export default function InPracticePage() {
  return (
    <>
      {/* ---- Hero ---- */}
      <section className="hero">
        <div className="container">
          <div className="label">In practice</div>
          <h1>Invariants grow with your system.</h1>
          <p className="tagline">
            You don&apos;t need to start with a complete inventory. Invariants emerge from two
            sources: what you design upfront, and what you discover from incidents. Both produce
            the same output: permanent, replayable proof.
          </p>
        </div>
      </section>

      {/* ---- Two sources ---- */}
      <section>
        <div className="container">
          <div className="label">Two sources, one system</div>
          <h2>Designed or discovered — they end up in the same place.</h2>
          <div className={styles.sourcesGrid}>
            <div className={styles.sourceCard}>
              <div className={styles.sourceLabel}>Designed upfront</div>
              <h3>You know what must be true before you build</h3>
              <p>
                Some invariants are obvious before you write the first line of code. A payment must
                have exactly one recipient. A session must have a start before it has an end. A
                document must have an author. These are contracts you can define at design time.
              </p>
              <p>
                Writing them as invariants before building means you catch violations before they
                reach production. The test writes itself from the promise.
              </p>
            </div>
            <div className={styles.sourceCard}>
              <div className={styles.sourceLabel}>Discovered from incidents</div>
              <h3>Something broke. Now it can never break silently again.</h3>
              <p>
                An incident reveals something that should always have been true — but was never
                made explicit. The fix is not just patching the bug. The fix is converting the
                insight into an invariant.
              </p>
              <p>
                Every incident becomes a permanent regression test. Not in a test file that might
                be skipped — as a runtime invariant that runs on every deploy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- The cycle ---- */}
      <section>
        <div className="container">
          <div className="label">The 4-step cycle</div>
          <h2>Build, define, deploy, decide.</h2>
          <div className={styles.cycleSteps}>
            <div className={styles.cycleStep}>
              <div className={styles.cycleNum}>1</div>
              <div className={styles.cycleContent}>
                <h3>Build</h3>
                <p>
                  A feature ships. The code is written, reviewed, merged. A promise was made about
                  what this feature does.
                </p>
              </div>
            </div>
            <div className={styles.cycleArrow}>↓</div>
            <div className={styles.cycleStep}>
              <div className={styles.cycleNum}>2</div>
              <div className={styles.cycleContent}>
                <h3>Make the invariant</h3>
                <p>
                  Define what must always be true about the output this feature produces. This
                  becomes a permanent contract — not a one-time test.
                </p>
              </div>
            </div>
            <div className={styles.cycleArrow}>↓</div>
            <div className={styles.cycleStep}>
              <div className={styles.cycleNum}>3</div>
              <div className={styles.cycleContent}>
                <h3>Deploy</h3>
                <p>
                  Every subsequent deploy runs the invariant against real infrastructure. Not a
                  mock, not a sandbox. Real AWS accounts, real data paths.
                </p>
              </div>
            </div>
            <div className={styles.cycleArrow}>↓</div>
            <div className={styles.cycleStep}>
              <div className={styles.cycleNum}>4</div>
              <div className={styles.cycleContent}>
                <h3>Pass or block</h3>
                <p>
                  The invariant either passes or it doesn&apos;t. If it fails, the deploy is
                  blocked. The decision is made by evidence, not by judgment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- CI card ---- */}
      <section>
        <div className="container">
          <div className="label">What it looks like</div>
          <h2>A real CI pipeline with invariant gates.</h2>
          <div className={styles.ciCard}>
            <div className={styles.ciHeader}>
              <span className={styles.ciTitle}>GitHub Actions — Pull Request #847</span>
              <span className={styles.ciBranch}>feat/synthesis-v2</span>
            </div>
            <div className={styles.ciRuns}>
              {[
                { name: 'Pipeline Smoke Tests', status: 'pass', duration: '1m 12s' },
                { name: 'Critical User Journey Gates', status: 'pass', duration: '3m 44s' },
                { name: 'Identity Regression Pack', status: 'pass', duration: '2m 08s' },
                { name: 'Face Grounding Regressions', status: 'pass', duration: '4m 22s' },
                { name: 'Synthesis Provenance Probe', status: 'fail', duration: '5m 01s' },
              ].map((run) => (
                <div key={run.name} className={`${styles.ciRun} ${run.status === 'fail' ? styles.ciRunFail : ''}`}>
                  <span className={run.status === 'pass' ? styles.ciPass : styles.ciFail}>
                    {run.status === 'pass' ? '✓' : '✗'}
                  </span>
                  <span className={styles.ciName}>{run.name}</span>
                  <span className={styles.ciDuration}>{run.duration}</span>
                </div>
              ))}
            </div>
            <div className={styles.ciFooter}>
              <span className={styles.ciStatus}>1 check failed — deploy blocked</span>
            </div>
          </div>
          <div className="callout">
            <p>
              Not a mockup. These runs execute against real AWS infrastructure with disposable test
              accounts. Every run produces proof. A failure here means something changed that
              should not have changed.
            </p>
          </div>
        </div>
      </section>

      {/* ---- Before / after ---- */}
      <section>
        <div className="container">
          <div className="label">The transformation</div>
          <h2>Before and after invariant gates.</h2>
          <div className={styles.beforeAfter}>
            <div className={styles.beforeCard}>
              <div className={styles.beforeAfterLabel}>Before</div>
              <ul className={styles.contrastList}>
                <li>Deploy and hope nothing broke</li>
                <li>Find out about failures from users or stakeholders</li>
                <li>Incidents create stories — not invariants</li>
                <li>Trust is based on the absence of visible failures</li>
              </ul>
            </div>
            <div className={styles.afterCard}>
              <div className={styles.beforeAfterLabel}>After</div>
              <ul className={styles.contrastList}>
                <li>Deploy only when proof passes</li>
                <li>Failures surface at the gate — before they reach users</li>
                <li>Every incident becomes a permanent regression check</li>
                <li>Trust is based on evidence</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Beyond deploy ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">Beyond the deploy gate</div>
          <h2>Deploy gates are the beginning, not the ceiling.</h2>
          <p>
            Deploy gates prove correctness at ship time. But production is a different environment
            — with real user data, real edge cases, and real scale. Runtime invariant signals extend
            the same proof mechanism into live systems.
          </p>
          <p>
            Every record that passes through a runtime-invariant-aware pipeline carries its own
            proof artifact. That proof is queryable, auditable, and attached to the data itself.
            The audit trail is the data.
          </p>
          <div className="callout">
            <p>
              The question changes from &ldquo;did it work when we shipped?&rdquo; to &ldquo;is it
              working correctly right now, on this specific record, at this specific moment?&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="cta-section">
        <div className="container">
          <h2>Want to see this applied to your system?</h2>
          <p>Start with a conversation about what must always be true in your pipeline.</p>
          <div className={styles.ctaButtons}>
            <Link href="/contact" className="cta-button">
              Start the conversation &rarr;
            </Link>
            <Link href="/invariant-design" className="cta-button-outline">
              Back to Invariant Design &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
