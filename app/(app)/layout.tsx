import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AppShell from './AppShell';
import { SESSION_COOKIE } from '../api/_db';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionId) {
    redirect('/login?next=/dashboard');
  }

  return <AppShell>{children}</AppShell>;
}
