import React from 'react';
import Link from 'next/link';
import styles from './klopt-het-beeld.module.css';

export const metadata = {
  title: 'Klopt het beeld nog? — Synesthetic Minds',
  description:
    'A self-scan for one process: lay your picture of the work next to the work itself, and see where they drift apart.',
};

const ROWS = [
  { thema: 'The steps', beeld: 'Which steps do you think are taken?', werk: 'Which steps are actually taken, including the workarounds?' },
  { thema: 'The exceptions', beeld: 'How often does it deviate from the standard?', werk: 'What do the people who do it daily say?' },
  { thema: 'The unwritten', beeld: 'Which agreements do you assume are followed?', werk: 'Which agreements exist that are written down nowhere? (the notebook)' },
  { thema: 'The why', beeld: 'Do you know why it is done this way?', werk: 'Or only that it is supposed to be done this way?' },
  { thema: 'The seams', beeld: 'Where does this process touch the next?', werk: 'And who pays there for what the other gains?' },
];

export default function ZelfScanPage() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="label">Self-scan</div>
          <h1>Does the picture still fit?</h1>
          <p className="tagline">
            Pick one process or sub-process you believe you know well. Exactly that one. The more
            self-evident it feels, the more this scan will show you.
          </p>
        </div>
      </section>

      <section className="prose">
        <div className="container">
          <div className="label">Two columns</div>
          <h2>Your picture, next to the work itself.</h2>
          <p>
            Fill in the left column with what you believe happens. Fill in the right column with what
            actually happens, by going to look and to ask. You do not fill the right column from your
            head.
          </p>
          <div className={styles.scanTableWrap}>
            <table className={styles.scanTable}>
              <thead>
                <tr>
                  <th>Theme</th>
                  <th>Your picture</th>
                  <th>The work itself (go look &amp; ask)</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, i) => (
                  <tr key={i}>
                    <td>{row.thema}</td>
                    <td>{row.beeld}</td>
                    <td>{row.werk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.downloadRow}>
            Prefer to print it and fill it in on the floor?{' '}
            <a
              href="https://docs.google.com/spreadsheets/d/1SIO9QAbybOHPgdYfGGmFeARe7cI2fz6jfMxhddJglT8/edit"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open the printable scan
            </a>
          </p>
        </div>
      </section>

      <section className="prose">
        <div className="container">
          <div className="label">The mirror</div>
          <h2>How sure were you?</h2>
          <div className="callout-amber">
            <p>
              Could you fill the right column from your own observation, or did you have to guess?
              Every guess is a place where your picture and the work may drift apart. And note: the
              more certain you were, the greater the risk. Certainty is exactly what hides the gap.
            </p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>And now?</h2>
          <p>
            You only truly fill the right column by going to see: joining the work, asking, looking
            without judging. That is where Evident Design begins.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/contact" className="cta-button">
              Start a conversation &rarr;
            </Link>
            <Link href="/evident-design" className="cta-button-outline">
              About Evident Design &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
