'use client';

import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '../src/store/store';

export default function Providers({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
