import Link from 'next/link';
import styles from './why-now.module.css';

export const metadata = {
  title: 'Why Now — Synesthetic Minds',
  description: 'You ship faster than you can verify. That gap is where trust erodes.',
};

export default function WhyNowPage() {
  return (
    <>
      {/* ---- Hero ---- */}
      <section className="hero">
        <div className="container">
          <div className="label">Why now</div>
          <h1>You ship faster than you can verify.</h1>
          <p className="tagline">
            Features are multiplying. Promises even faster. The gap between what you ship and what
            you can prove is widening — and most teams don&apos;t feel it until a decision has
            already been made on unverified output.
          </p>
        </div>
      </section>

      {/* ---- The gap ---- */}
      <section>
        <div className="container">
          <div className="label">The widening gap</div>
          <h2>Three lines. One problem.</h2>
          <p>
            As products grow, three things happen at different speeds. Features accelerate.
            Promises to stakeholders grow even faster. Verification stays flat — because no
            one built the infrastructure for it.
          </p>
          <div className={styles.gapViz}>
            <div className={styles.gapRow}>
              <span className={styles.gapLabel}>Features shipped</span>
              <div className={styles.gapBar}>
                <div className={`${styles.gapFill} ${styles.gapFillAccent}`} style={{ width: '75%' }} />
              </div>
              <span className={styles.gapValue}>Accelerating</span>
            </div>
            <div className={styles.gapRow}>
              <span className={styles.gapLabel}>Promises made</span>
              <div className={styles.gapBar}>
                <div className={`${styles.gapFill} ${styles.gapFillAmber}`} style={{ width: '88%' }} />
              </div>
              <span className={styles.gapValue}>Growing faster</span>
            </div>
            <div className={styles.gapRow}>
              <span className={styles.gapLabel}>Verification coverage</span>
              <div className={styles.gapBar}>
                <div className={`${styles.gapFill} ${styles.gapFillMuted}`} style={{ width: '22%' }} />
              </div>
              <span className={styles.gapValue}>Flat</span>
            </div>
          </div>
          <div className="callout-amber">
            <p>
              The gap is not a technical problem. It is a structural one. The faster you move,
              the more ground verification loses — unless you build it in from the start.
            </p>
          </div>
        </div>
      </section>

      {/* ---- Timeline ---- */}
      <section>
        <div className="container">
          <div className="label">How it plays out</div>
          <h2>Three moments on the same timeline.</h2>
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineMarker}>
                <span className={styles.timelineWeek}>Week 4</span>
              </div>
              <div className={styles.timelineContent}>
                <h3>A stakeholder asks</h3>
                <p>
                  &ldquo;Can we confirm this is working correctly?&rdquo; — The team says yes,
                  based on the fact that it hasn&apos;t visibly failed. Not because they can prove
                  it.
                </p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <div className={`${styles.timelineMarker} ${styles.timelineMarkerAmber}`}>
                <span className={styles.timelineWeek}>Week 8</span>
              </div>
              <div className={styles.timelineContent}>
                <h3>A silent bug lands</h3>
                <p>
                  Something changed upstream. The system kept running. The output changed
                  in a way that no one noticed — because no invariant was watching.
                </p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <div className={`${styles.timelineMarker} ${styles.timelineMarkerRed}`}>
                <span className={styles.timelineWeek}>Week 12</span>
              </div>
              <div className={styles.timelineContent}>
                <h3>Trust erodes</h3>
                <p>
                  Someone finds the discrepancy. Decisions were made on incorrect output for four
                  weeks. The question now is not just what to fix — it&apos;s what else might be
                  wrong.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- The insight ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">The insight</div>
          <h2>The same AI that created the problem can close the gap.</h2>
          <p>
            AI accelerates feature development. That is the same force that widens the gap between
            what&apos;s shipped and what&apos;s verified. But AI can also be used to generate
            invariants, apply them at runtime, and produce proof artifacts automatically.
          </p>
          <p>
            The question is not whether to use AI. The question is whether you also use it to
            close the verification gap — or only to widen it.
          </p>
          <div className="callout">
            <p>
              Invariant Design is the infrastructure that lets you move fast without losing the
              ability to prove what you shipped.
            </p>
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to close the gap?</h2>
          <p>Learn how Invariant Design gives you proof at every run.</p>
          <div className={styles.ctaButtons}>
            <Link href="/invariant-design" className="cta-button">
              See Invariant Design &rarr;
            </Link>
            <Link href="/vs-analytics" className="cta-button-outline">
              What analytics doesn&apos;t tell you &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
