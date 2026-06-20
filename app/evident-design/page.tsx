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
          <p>
            The talk-document form grew in a large logistics organisation, where standard instructions
            were used to make the work discussable rather than to enforce it.
          </p>
        </div>
      </section>

      {/* ---- SI: our own standard ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">In practice</div>
          <h2>Our own standard, as a talk-document.</h2>
          <p>
            We apply Evident Design to ourselves too. This is how a join-the-work engagement runs: we
            take part in the work, two weeks to a month, and only then propose something grounded in
            lived experience. The full form stays visible, the why included, for everyone involved in
            the work, so the value of each step is there to follow.
          </p>
          <div className={styles.siTableWrap}>
            <table className={styles.siTable}>
              <thead>
                <tr>
                  {['Nr', 'What? (Step)', 'How?', 'Why?', 'SQDC', 'Artefact'].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['1', 'Intake conversation', '1. Get one question sharp: which decision is the client about to make, and on which system output is it based?\n2. Together decide where we join the work and for how long (two weeks to a month).\n3. Agree upfront: we take part, we do not judge.', 'Without a real decision behind it there is no focus. The question sets where we look, and the no-fault agreement makes people open later on.', 'Safety - The upfront no-fault agreement takes the fear out.\nQuality - A sharp question focuses the observation.\nDelivery - A clear start gives a clear end.\nCost - No time wasted on too broad a scope.', 'The sharp question, written down.'],
                  ['2', 'Joining the work', '1. Take part in the work itself, not watching from a distance.\n2. Follow the daily flow, including the busy moments and the exceptions.\n3. Stay on the same side as the people; no separate observer position.', 'The capacity and the real logic live in the doing. You only see them by taking part, not from the sidelines.', 'Safety - Taking part rather than watching keeps the floor at ease.\nQuality - You see the real work, not a staged version.\nDelivery - First signals of where picture and work diverge.\nCost - No costly observation setup, just joining in.', 'Field notes from taking part.'],
                  ['3', 'Observing and naming', '1. Record what actually happens, per group involved.\n2. Factual, without adding interpretation: what was seen, what was said, where the picture diverged from the work.\n3. Something out of scope? Name it, do not step in.', 'No-fault. It is information, not a verdict. Recognition for the people, insight for leadership. A gap between picture and work is the finding, not the reproach.', 'Safety - Factual and without judgement keeps it safe.\nQuality - Recording per group makes the picture complete.\nDelivery - The observation becomes the basis of the proposal.\nCost - Role clarity prevents disrupting the work.', 'Observation document per group involved.'],
                  ['4', 'Conversations from taking part', '1. Give back what was observed and walk through it together.\n2. As a talk-document, not a report.\n3. Discuss the deviations and edge cases and test whether it holds.', 'The document secures the seeing, not the control. Drift becomes visible in the conversation, not ticked off.', 'Safety - A conversation, not a reckoning.\nQuality - Testing with the people sharpens the picture.\nDelivery - A shared picture enables a supported proposal.\nCost - Misunderstandings out before anything is built.', 'Talk-document (the living SI).'],
                  ['5', 'Proposal grounded in lived experience', '1. Make visible and keep alive as a talk-document (Evident Design).\n2. What is stable and critical enough, secure hard in software (Invariant Design).\n3. The proposal rests on what we experienced, not on an assumption.', 'A proposal from reality, not off-the-shelf. Does the client want a solution sooner? See first, propose after.', 'Safety - A proposal the people recognise will hold.\nQuality - Grounded in what actually happens.\nDelivery - Concrete: what to see, what to secure, and how.\nCost - No investment in something that does not fit.', 'The proposal, with scope and layers (ED/ID).'],
                ].map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
