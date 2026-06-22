import ScanForm from './ScanForm';

export const metadata = {
  title: 'Does the picture still fit? — Synesthetic Minds',
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

      <ScanForm
        evidentHref="/evident-design"
        t={{
          introLabel: 'Two columns',
          introTitle: 'Your picture, next to the work itself.',
          introP:
            'Fill in the left column with what you believe happens. Fill in the right column with what actually happens, by going to look and to ask. You do not fill the right column from your head. Print the completed form for yourself, or send it to us if you want to look into it together.',
          procesLabel: 'Which process or sub-process?',
          procesPlaceholder: 'For example: processing orders, onboarding a customer, handling an incident',
          colThema: 'Theme',
          colBeeld: 'Your picture',
          colWerk: 'The work itself (go look & ask)',
          rows: ROWS,
          fillPlaceholder: 'Fill in…',
          printButton: 'Print or save as PDF',
          mirrorLabel: 'The mirror',
          mirrorTitle: 'How sure were you?',
          mirrorP:
            'Could you fill the right column from your own observation, or did you have to guess? Every guess is a place where your picture and the work may drift apart. And note: the more certain you were, the greater the risk. Certainty is exactly what hides the gap.',
          ctaTitle: 'And now?',
          ctaP:
            'You only truly fill the right column by going to see: joining the work, asking, looking without judging. That is where Evident Design begins.',
          nameLabel: 'Your name',
          emailLabel: 'Your email address',
          consentLabel: 'You may use my answers to improve your approach.',
          sendButton: 'Send to us for a conversation →',
          sending: 'Sending…',
          sentOk: 'Thank you. We received your scan and will reach out for a no-obligation conversation.',
          errInvalidEmail: 'Please enter a valid email address to send your scan.',
          errGeneric: 'Something went wrong while sending. Please try again, or email info@synestheticminds.nl.',
          ctaSecondary: 'About Evident Design →',
        }}
      />
    </>
  );
}
