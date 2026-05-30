import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://synestheticminds.com'),
  title: 'Synesthetic Minds — Build trust in your systems',
  description:
    'Most organizations get little return on AI, not because the technology fails, but because AI amplifies the picture, not the work itself. We make the whole visible.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
