'use client';

import { useAppSelector } from '../../../src/store/hooks';
import styles from './page.module.css';

type AppUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
};

function getInitials(user: AppUser | null) {
  if (!user) return 'U';
  const first = user.firstName?.[0] ?? '';
  const last = user.lastName?.[0] ?? '';
  const fallback = user.username?.[0] ?? 'U';
  return `${first}${last}`.trim() || fallback.toUpperCase();
}

export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user as AppUser | null);

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt="Profile avatar" className={styles.avatar} />
        ) : (
          <div className={styles.avatarFallback}>{getInitials(user)}</div>
        )}
        <div>
          <h2 className={styles.title}>Profile</h2>
          <p className={styles.subtitle}>Your account details</p>
        </div>
      </header>

      <dl className={styles.grid}>
        <div>
          <dt>First name</dt>
          <dd>{user?.firstName || '—'}</dd>
        </div>
        <div>
          <dt>Last name</dt>
          <dd>{user?.lastName || '—'}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{user?.email || '—'}</dd>
        </div>
        <div>
          <dt>Username</dt>
          <dd>{user?.username || '—'}</dd>
        </div>
      </dl>

      <pre className={styles.debug}>{JSON.stringify(user, null, 2)}</pre>
    </section>
  );
}
