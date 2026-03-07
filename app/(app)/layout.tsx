import type { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return <section>{children}</section>;
}
