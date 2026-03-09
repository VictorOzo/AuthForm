'use client';

import { useEffect, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { meThunk } from '../src/store/authSlice';
import { useAppDispatch } from '../src/store/hooks';
import { store } from '../src/store/store';

function AuthHydrator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(meThunk());
  }, [dispatch]);

  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator />
      {children}
    </Provider>
  );
}
