'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { logoutThunk } from '../../src/store/authSlice';
import styles from './layout.module.css';

type AppUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
};

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/profile', label: 'Profile' },
  { href: '/settings', label: 'Settings' },
];

function getInitials(user: AppUser | null) {
  if (!user) return 'U';
  const first = user.firstName?.trim()?.[0] ?? '';
  const last = user.lastName?.trim()?.[0] ?? '';
  const fallback = user.username?.trim()?.[0] ?? 'U';
  return `${first}${last}`.trim() || fallback.toUpperCase();
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user as AppUser | null);

  const displayName = useMemo(
    () => user?.firstName || user?.username || 'User',
    [user?.firstName, user?.username],
  );

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    router.push('/login');
  };

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <h1 className={styles.brand}>AuthForm</h1>
        <nav className={styles.nav} aria-label="Main navigation">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${isActive ? styles.active : ''}`.trim()}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button type="button" className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <div className={styles.mainColumn}>
        <header className={styles.topbar}>
          <div className={styles.userInfo}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={`${displayName} avatar`} className={styles.avatar} />
            ) : (
              <div className={styles.avatarFallback} aria-hidden="true">
                {getInitials(user)}
              </div>
            )}
            <p className={styles.userName}>{displayName}</p>
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
