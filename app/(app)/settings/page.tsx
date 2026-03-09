'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../src/store/hooks';
import { meThunk, updateProfileThunk } from '../../../src/store/authSlice';
import styles from './page.module.css';

type AppUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
};

type FormErrors = {
  firstName?: string;
  lastName?: string;
  username?: string;
};

function getInitials(user: AppUser | null) {
  if (!user) return 'U';
  return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.trim() || user.username?.[0] || 'U';
}

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user as AppUser | null);
  const status = useAppSelector((state) => state.auth.status);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  useEffect(() => {
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
    setUsername(user?.username ?? '');
  }, [user]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const avatarSrc = useMemo(() => previewUrl || user?.avatarUrl || null, [previewUrl, user?.avatarUrl]);

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!firstName.trim()) nextErrors.firstName = 'First name is required.';
    if (!lastName.trim()) nextErrors.lastName = 'Last name is required.';
    if (!username.trim()) nextErrors.username = 'Username is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    await dispatch(
      updateProfileThunk({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
      }),
    );
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUploadMessage(null);
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('Please select an image first.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    const response = await fetch('/api/user/avatar', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      setUploadMessage('Upload failed. Please try again.');
      return;
    }

    setUploadMessage('Avatar uploaded (demo mode). Refreshing profile...');
    await dispatch(meThunk());
  };

  return (
    <section className={styles.container}>
      <article className={styles.card}>
        <h2 className={styles.heading}>Profile settings</h2>

        <form className={styles.form} onSubmit={handleSave} noValidate>
          <div className={styles.field}>
            <label htmlFor="firstName">First name</label>
            <input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              aria-invalid={Boolean(errors.firstName)}
            />
            <p className={styles.error}>{errors.firstName || '\u00a0'}</p>
          </div>

          <div className={styles.field}>
            <label htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              aria-invalid={Boolean(errors.lastName)}
            />
            <p className={styles.error}>{errors.lastName || '\u00a0'}</p>
          </div>

          <div className={styles.field}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-invalid={Boolean(errors.username)}
            />
            <p className={styles.error}>{errors.username || '\u00a0'}</p>
          </div>

          <button className={styles.saveButton} type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </article>

      <article className={styles.card}>
        <h3 className={styles.heading}>Avatar</h3>
        <div className={styles.avatarRow}>
          {avatarSrc ? (
            <img src={avatarSrc} alt="Avatar preview" className={styles.avatar} />
          ) : (
            <div className={styles.avatarFallback}>{getInitials(user)}</div>
          )}

          <div className={styles.avatarControls}>
            <label htmlFor="avatar">Select avatar image</label>
            <input id="avatar" type="file" accept="image/*" onChange={handleFileChange} />
            <button type="button" onClick={handleAvatarUpload} className={styles.uploadButton}>
              Upload avatar
            </button>
            <p className={styles.helpText}>{uploadMessage || 'TODO: Wire server-side persistence for avatar files.'}</p>
          </div>
        </div>
      </article>
    </section>
  );
}
