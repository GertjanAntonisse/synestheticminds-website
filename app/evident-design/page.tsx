import React from 'react';
import Link from 'next/link';
import styles from './evident-design.module.css';

export const metadata = {
  title: 'Evident Design — Synesthetic Minds',
  description:
    'Make the real work visible and keep the agreements about it alive, so drift shows before it does damage.',
};

export default function EvidentDesignPage() {
  return (
    <>
      {/* ---- Hero ---- */}
      <section className="hero">
        <div className="container">
          <div className="label">Evident Design</div>
          <h1>Everyone finds their own work self-evident. And that is exactly why there is so much to see.</h1>
          <p className="tagline">
            An organisation&apos;s capacity to improve lives on the floor, in how people do and adjust
            the work every day. Evident Design makes that work visible and captures the agreements
            about it so that drift stands out. No new method, no Lean off the shelf.
          </p>
        </div>
      </section>

      {/* ---- Recognition ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">The pattern you recognise</div>
          <h2>The work runs. The picture you have of it quietly drifts away.</h2>
          <p>
            No one decided it should change. An exception came up, someone found a handy workaround,
            an agreement wore thin. The work kept going, so no one noticed. The picture in the
            boardroom stayed put; the floor moved on.
          </p>
          <p>
            Only when something goes wrong, or when you lay AI over that work, does it show how far
            the picture and the work have grown apart.
          </p>
          <div className="callout-amber">
            <p>
              It is not unwillingness and not a fault. People keep things running within what they can
              oversee. That is how it works, until no one sees the whole anymore.
            </p>
          </div>
        </div>
      </section>

      {/* ---- The core ---- */}
      <section>
        <div className="container">
          <div className="label">The core idea</div>
          <h2>An agreement that shows its own drift.</h2>
          <p>
            Evident Design captures how the work actually runs, not as a process description in a
            drawer, but as a talk-document: a living standard you walk through together. Precisely by
            discussing it, you see where reality has drifted from the agreement. The document secures
            the seeing, not the control.
          </p>
          <div className={styles.valueChain}>
            {['Work', 'Agreement', 'Talk-document', 'Drift made visible', 'Conversation'].map(
              (item, i, arr) => (
                <React.Fragment key={item}>
                  <div className={styles.chainItem}>
                    <span className={styles.chainLabel}>{item}</span>
                  </div>
                  {i < arr.length - 1 && <div className={styles.chainArrow}>&rarr;</div>}
                </React.Fragment>
              )
            )}
          </div>
          <p className={styles.chainNote}>
            Not a checklist to tick off, but a document to talk with. The drift is not proof that
            someone failed, it is the starting point of improvement.
          </p>
        </div>
      </section>

      {/* ---- 4-step approach ---- */}
      <section>
        <div className="container">
          <div className="label">How it works</div>
          <h2>Four steps, from seeing to securing.</h2>
          <div className={styles.stepsRow}>
            {[
              { num: 1, title: 'See', p: 'We map what the work actually does, in the place where it happens. Not what it should do, what it does.' },
              { num: 2, title: 'Agree', p: 'What the working way is here, we make explicit, together with the people who do the work. Their knowledge, not an import.' },
              { num: 3, title: 'Capture', p: 'The agreement becomes a talk-document: short, tailored, written so that drift stands out the moment reality shifts.' },
              { num: 4, title: 'Review together', p: 'At set intervals we walk through the document. Does it still match the work? What drifts is worth a conversation, not a reproach.' },
            ].map(({ num, title, p }) => (
              <div key={num} className={styles.stepCard}>
                <div className={styles.stepNum}>{num}</div>
                <h3>{title}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Where it leads ---- */}
      <section>
        <div className="container">
          <div className="label">Where it leads</div>
          <h2>Visible work can be secured.</h2>
          <p>
            Once the work is evident, a new question becomes possible: which agreements are stable and
            important enough to secure hard? Where the work sits in software, Invariant Design takes
            over: the same agreement, now provable at every run. Evident Design makes it visible,
            Invariant Design keeps it proven.
          </p>
          <div className={styles.valueChain}>
            {['Evident Design', 'Selection', 'Invariant Design'].map((item, i, arr) => (
              <React.Fragment key={item}>
                <div className={styles.chainItem}>
                  <span className={styles.chainLabel}>{item}</span>
                </div>
                {i < arr.length - 1 && <div className={styles.chainArrow}>&rarr;</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Proven ---- */}
      <section>
        <div className="container">
          <div className="label">Proven in practice</div>
          <h2>Grown on the floor, not at the drawing board.</h2>
          <p className={styles.projectNote}>
            The talk-document form grew in a large logistics organisation, where standard instructions
            were used to make the work discussable rather than to enforce it.
          </p>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="cta-section">
        <div className="container">
          <h2>Want to see what your work really does?</h2>
          <p>One conversation, no obligation. We start from what is already running.</p>
          <div className={styles.ctaButtons}>
            <Link href="/contact" className="cta-button">
              Start a conversation &rarr;
            </Link>
            <Link href="/invariant-design" className="cta-button-outline">
              On to Invariant Design &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
