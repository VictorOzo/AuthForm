'use client';

import { useAppSelector } from '../../../src/store/hooks';
import styles from './page.module.css';

type AppUser = {
  firstName?: string;
  email?: string;
  username?: string;
};

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user as AppUser | null);
  const firstName = user?.firstName || user?.username || 'there';

  return (
    <section className={styles.container}>
      <article className={styles.card}>
        <h2 className={styles.title}>Welcome, {firstName}</h2>
        <p className={styles.subtitle}>Here is your account snapshot.</p>
      </article>

      <article className={styles.card}>
        <h3 className={styles.sectionTitle}>Account summary</h3>
        <dl className={styles.summary}>
          <div>
            <dt>Email</dt>
            <dd>{user?.email || '—'}</dd>
          </div>
          <div>
            <dt>Username</dt>
            <dd>{user?.username || '—'}</dd>
          </div>
        </dl>
      </article>
    </section>
  );
}
