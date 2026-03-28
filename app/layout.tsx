import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Synesthetic Minds — Build trust in your systems',
  description:
    'Organizations fail with AI not because the technology doesn\'t work, but because a silent error gets quietly scaled up. We make that visible.',
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
