import { redirect } from 'next/navigation';

// Fallback for local dev when middleware doesn't run
export default function RootPage() {
  redirect('/nl');
}
