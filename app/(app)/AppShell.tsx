'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logoutThunk } from '../../src/store/authSlice';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import styles from './layout.module.css';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/profile', label: 'Profile' },
  { href: '/settings', label: 'Settings' },
];

function getInitials(firstName?: string, lastName?: string, username?: string, email?: string) {
  const first = firstName?.trim()?.[0] ?? '';
  const last = lastName?.trim()?.[0] ?? '';
  const fallback = username?.trim()?.[0] ?? email?.trim()?.[0] ?? 'U';
  return `${first}${last}`.trim() || fallback.toUpperCase();
}

export default function AppShell({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);

  const displayName = useMemo(
    () => user?.firstName || user?.username || user?.email || 'User',
    [user?.firstName, user?.username, user?.email],
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
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`.trim()}
            >
              {link.label}
            </Link>
          ))}
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
                {getInitials(user?.firstName, user?.lastName, user?.username, user?.email)}
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
