import Link from 'next/link';
import styles from './vs-analytics.module.css';

export const metadata = {
  title: 'What Analytics Doesn\'t Tell You — Synesthetic Minds',
  description:
    'Analytics measures activity. Invariants measure correctness. The difference matters when decisions are made on the output.',
};

export default function VsAnalyticsPage() {
  return (
    <>
      {/* ---- Hero ---- */}
      <section className="hero">
        <div className="container">
          <div className="label">What analytics doesn&apos;t tell you</div>
          <h1>Analytics tells you work was done. Invariants tell you the work was done correctly.</h1>
          <p className="tagline">
            Both are necessary. Only one tells you whether the output your decisions are based on
            is actually correct.
          </p>
        </div>
      </section>

      {/* ---- Core distinction ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">The core distinction</div>
          <h2>Activity versus correctness.</h2>
          <p>
            Analytics answers: how many, how fast, how often. It measures what happened, when it
            happened, and how much of it happened. It is built for understanding volume, patterns,
            and trends.
          </p>
          <p>
            Invariants answer a different question: did the thing that happened produce the right
            result? Not whether the function ran — whether it ran correctly. Not whether the record
            was created — whether the record contains what it should.
          </p>
          <div className="callout">
            <p>
              A funnel can show 100% completion. Invariants can show that step 4 violated its
              contract — and every &ldquo;completed&rdquo; record after that point is wrong.
            </p>
          </div>
        </div>
      </section>

      {/* ---- Comparison table ---- */}
      <section>
        <div className="container">
          <div className="label">Side by side</div>
          <h2>The same question, two different instruments.</h2>
          <div className={styles.comparisonTable}>
            <div className={styles.tableHeader}>
              <div className={styles.tableCol} />
              <div className={`${styles.tableCol} ${styles.tableColAnalytics}`}>
                Analytics<br />
                <span className={styles.tableSubhead}>GA4, Mixpanel, etc.</span>
              </div>
              <div className={`${styles.tableCol} ${styles.tableColInvariant}`}>
                Invariant signals
              </div>
            </div>
            {[
              {
                question: 'Did the process run?',
                analytics: 'Yes — event count shows 1,847 runs',
                invariant: 'Yes — and 23 of them violated the correctness contract',
              },
              {
                question: 'Did it complete?',
                analytics: 'Yes — 94% completion rate',
                invariant: '94% reached the final step. 12% of those produced incorrect output.',
              },
              {
                question: 'Is the output correct?',
                analytics: 'No signal',
                invariant: 'Proof artifact attached to each record. Pass or fail per row.',
              },
              {
                question: 'When did it break?',
                analytics: 'Unknown — no event for correctness failure',
                invariant: 'Exact run, exact record, exact invariant that was violated.',
              },
              {
                question: 'Who is affected?',
                analytics: 'Segment by user property',
                invariant: 'All records where invariant X failed — retrievable immediately.',
              },
            ].map((row, i) => (
              <div key={i} className={styles.tableRow}>
                <div className={`${styles.tableCol} ${styles.tableQuestion}`}>{row.question}</div>
                <div className={`${styles.tableCol} ${styles.tableAnalytics}`}>{row.analytics}</div>
                <div className={`${styles.tableCol} ${styles.tableInvariant}`}>{row.invariant}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Same journey two views ---- */}
      <section>
        <div className="container">
          <div className="label">Same journey, two views</div>
          <h2>What each instrument sees.</h2>
          <div className={styles.twoViews}>
            <div className={styles.viewCard}>
              <div className={styles.viewCardLabel}>Analytics view</div>
              <div className={styles.funnelSteps}>
                {[
                  { label: 'Step 1: Start', pct: '100%', ok: true },
                  { label: 'Step 2: Validate', pct: '98%', ok: true },
                  { label: 'Step 3: Process', pct: '96%', ok: true },
                  { label: 'Step 4: Contract check', pct: '95%', ok: true },
                  { label: 'Step 5: Complete', pct: '94%', ok: true },
                ].map((s) => (
                  <div key={s.label} className={styles.funnelStep}>
                    <span className={styles.funnelLabel}>{s.label}</span>
                    <span className={styles.funnelPct}>{s.pct}</span>
                    <span className={styles.funnelOk}>&#10003;</span>
                  </div>
                ))}
              </div>
              <p className={styles.viewNote}>Conclusion: 94% funnel completion. Looks fine.</p>
            </div>
            <div className={styles.viewCard}>
              <div className={styles.viewCardLabel}>Invariant view</div>
              <div className={styles.funnelSteps}>
                {[
                  { label: 'Step 1: Start', ok: true },
                  { label: 'Step 2: Validate', ok: true },
                  { label: 'Step 3: Process', ok: true },
                  { label: 'Step 4: Contract check', ok: false, signal: 'contract_failed' },
                  { label: 'Step 5: Complete', ok: false, signal: 'downstream tainted' },
                ].map((s) => (
                  <div key={s.label} className={`${styles.funnelStep} ${s.ok ? '' : styles.funnelStepFail}`}>
                    <span className={styles.funnelLabel}>{s.label}</span>
                    {s.signal && <span className={styles.funnelSignal}>{s.signal}</span>}
                    <span className={s.ok ? styles.funnelOk : styles.funnelFail}>
                      {s.ok ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
              <p className={`${styles.viewNote} ${styles.viewNoteFail}`}>
                Conclusion: contract_failed at step 4. All downstream records are tainted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Blind spots ---- */}
      <section>
        <div className="container">
          <div className="label">The four blind spots</div>
          <h2>What analytics consistently misses.</h2>
          <div className={styles.blindSpots}>
            <div className={styles.blindSpot}>
              <h3>The silent wrong answer</h3>
              <p>
                The function ran. The record was created. The answer is wrong. Analytics sees
                completion. Invariants see the violation.
              </p>
            </div>
            <div className={styles.blindSpot}>
              <h3>The empty success</h3>
              <p>
                A record was written with empty fields where there should be data. The event fired.
                The metric incremented. The output is useless.
              </p>
            </div>
            <div className={styles.blindSpot}>
              <h3>The skipped step</h3>
              <p>
                A required validation step was bypassed. The process completed. Analytics sees a
                successful flow. The integrity guarantee was never applied.
              </p>
            </div>
            <div className={styles.blindSpot}>
              <h3>The duplicate that succeeded</h3>
              <p>
                An operation ran twice. Both succeeded. Analytics sees two completions. The second
                one should never have happened — and it created a corrupt state.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to add the correctness layer?</h2>
          <p>Analytics and invariants work together. One without the other leaves a gap.</p>
          <div className={styles.ctaButtons}>
            <Link href="/invariant-design" className="cta-button">
              See Invariant Design &rarr;
            </Link>
            <Link href="/in-practice" className="cta-button-outline">
              See it in practice &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
