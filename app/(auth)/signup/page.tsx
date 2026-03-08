'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './signup.module.css';
import { COUNTRY_OPTIONS } from './countries';
import {
  formatPhoneInput,
  getProvinceLabel,
  getProvinceOptions,
  normalizePhone,
  type SignupErrors,
  type SignupFormData,
  type SignupStep,
  validateAllSteps,
  validateStep,
} from './validation';

const STEP_LABELS = ['Account', 'Personal', 'Address'] as const;
const STEP_PERCENTAGES = [33, 66, 100] as const;

function getInitialCountryFromLocale(defaultCountry = 'CA'): string {
  if (typeof navigator === 'undefined') {
    return defaultCountry;
  }

  const locale = navigator.language || '';
  const localeCountry = locale.split('-')[1]?.toUpperCase();

  return COUNTRY_OPTIONS.some((country) => country.code === localeCountry) ? localeCountry : defaultCountry;
}

export default function SignupPage() {
  const router = useRouter();

  const [step, setStep] = useState<SignupStep>(1);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneCountry: getInitialCountryFromLocale(),
    phone: '',
    country: 'CA',
    address1: '',
    address2: '',
    city: '',
    province: '',
    postalCode: '',
    acceptTerms: false,
    marketingOptIn: false,
  });

  const provinceOptions = useMemo(() => getProvinceOptions(formData.country), [formData.country]);
  const provinceLabel = getProvinceLabel(formData.country);
  const isProvinceSelect = provinceOptions.length > 0;

  const focusFirstError = (nextErrors: SignupErrors) => {
    const firstErrorField = Object.keys(nextErrors)[0] as keyof SignupFormData | undefined;
    if (!firstErrorField) return;

    const element = document.getElementById(firstErrorField);
    element?.focus();
  };

  const updateField = <K extends keyof SignupFormData>(field: K, value: SignupFormData[K]) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleNext = () => {
    const stepErrors = validateStep(step, formData);
    setErrors((current) => ({ ...current, ...stepErrors }));

    if (Object.keys(stepErrors).length > 0) {
      focusFirstError(stepErrors);
      return;
    }

    setStep((current) => (current < 3 ? ((current + 1) as SignupStep) : current));
  };

  const handleBack = () => {
    setFormError('');
    setStep((current) => (current > 1 ? ((current - 1) as SignupStep) : current));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    const allErrors = validateAllSteps(formData);
    setErrors(allErrors);

    if (Object.keys(allErrors).length > 0) {
      const firstStepWithError =
        allErrors.email || allErrors.password || allErrors.confirmPassword
          ? 1
          : allErrors.firstName || allErrors.lastName || allErrors.phone
            ? 2
            : 3;

      setStep(firstStepWithError);
      focusFirstError(allErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phoneCountry: formData.phoneCountry,
          phoneE164: normalizePhone(formData),
          address: {
            country: formData.country,
            address1: formData.address1.trim(),
            address2: formData.address2.trim(),
            city: formData.city.trim(),
            province: formData.province.trim(),
            postalCode: formData.postalCode.trim(),
          },
          marketingOptIn: formData.marketingOptIn,
        }),
      });

      if (!response.ok) {
        let message = 'Unable to create your account. Please try again.';

        try {
          const data = (await response.json()) as { message?: string };
          if (data?.message) {
            message = data.message;
          }
        } catch {
          // Keep fallback message.
        }

        setFormError(message);
        return;
      }

      router.push('/login');
    } catch {
      setFormError('Something went wrong. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <>
          <div className={styles.fieldGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className={styles.input}
              value={formData.email}
              onChange={(event) => updateField('email', event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email ? (
              <p id="email-error" className={styles.fieldError} role="alert">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className={styles.input}
              value={formData.password}
              onChange={(event) => updateField('password', event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password ? (
              <p id="password-error" className={styles.fieldError} role="alert">
                {errors.password}
              </p>
            ) : null}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              className={styles.input}
              value={formData.confirmPassword}
              onChange={(event) => updateField('confirmPassword', event.target.value)}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
            />
            {errors.confirmPassword ? (
              <p id="confirmPassword-error" className={styles.fieldError} role="alert">
                {errors.confirmPassword}
              </p>
            ) : null}
          </div>
        </>
      );
    }

    if (step === 2) {
      const phoneHintId = 'phone-hint';
      const phoneErrorId = 'phone-error';
      const showNorthAmericaHint = formData.phoneCountry === 'CA' || formData.phoneCountry === 'US';

      return (
        <>
          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label htmlFor="firstName" className={styles.label}>
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                className={styles.input}
                value={formData.firstName}
                onChange={(event) => updateField('firstName', event.target.value)}
                aria-invalid={Boolean(errors.firstName)}
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              />
              {errors.firstName ? (
                <p id="firstName-error" className={styles.fieldError} role="alert">
                  {errors.firstName}
                </p>
              ) : null}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="lastName" className={styles.label}>
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                className={styles.input}
                value={formData.lastName}
                onChange={(event) => updateField('lastName', event.target.value)}
                aria-invalid={Boolean(errors.lastName)}
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              />
              {errors.lastName ? (
                <p id="lastName-error" className={styles.fieldError} role="alert">
                  {errors.lastName}
                </p>
              ) : null}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label htmlFor="phoneCountry" className={styles.label}>
                Phone country
              </label>
              <select
                id="phoneCountry"
                name="phoneCountry"
                className={styles.input}
                value={formData.phoneCountry}
                onChange={(event) => {
                  const nextCountry = event.target.value;
                  updateField('phoneCountry', nextCountry);
                  updateField('phone', formatPhoneInput(formData.phone, nextCountry));
                }}>
                {COUNTRY_OPTIONS.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="phone" className={styles.label}>
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className={styles.input}
                value={formData.phone}
                onChange={(event) => updateField('phone', formatPhoneInput(event.target.value, formData.phoneCountry))}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? `${phoneHintId} ${phoneErrorId}` : phoneHintId}
              />
              <p id={phoneHintId} className={styles.hint}>
                {showNorthAmericaHint ? 'Format: (555) 555-5555' : 'Include country code if outside CA/US'}
              </p>
              {errors.phone ? (
                <p id={phoneErrorId} className={styles.fieldError} role="alert">
                  {errors.phone}
                </p>
              ) : null}
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <div className={styles.fieldGroup}>
          <label htmlFor="country" className={styles.label}>
            Country
          </label>
          <select
            id="country"
            name="country"
            className={styles.input}
            value={formData.country}
            onChange={(event) => {
              updateField('country', event.target.value);
              updateField('province', '');
              updateField('postalCode', '');
            }}>
            {COUNTRY_OPTIONS.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="address1" className={styles.label}>
            Address line 1
          </label>
          <input
            id="address1"
            name="address1"
            type="text"
            autoComplete="address-line1"
            className={styles.input}
            value={formData.address1}
            onChange={(event) => updateField('address1', event.target.value)}
            aria-invalid={Boolean(errors.address1)}
            aria-describedby={errors.address1 ? 'address1-error' : undefined}
          />
          {errors.address1 ? (
            <p id="address1-error" className={styles.fieldError} role="alert">
              {errors.address1}
            </p>
          ) : null}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="address2" className={styles.label}>
            Address line 2 <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id="address2"
            name="address2"
            type="text"
            autoComplete="address-line2"
            className={styles.input}
            value={formData.address2}
            onChange={(event) => updateField('address2', event.target.value)}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label htmlFor="city" className={styles.label}>
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              autoComplete="address-level2"
              className={styles.input}
              value={formData.city}
              onChange={(event) => updateField('city', event.target.value)}
              aria-invalid={Boolean(errors.city)}
              aria-describedby={errors.city ? 'city-error' : undefined}
            />
            {errors.city ? (
              <p id="city-error" className={styles.fieldError} role="alert">
                {errors.city}
              </p>
            ) : null}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="province" className={styles.label}>
              {provinceLabel}
            </label>
            {isProvinceSelect ? (
              <select
                id="province"
                name="province"
                className={styles.input}
                value={formData.province}
                onChange={(event) => updateField('province', event.target.value)}
                aria-invalid={Boolean(errors.province)}
                aria-describedby={errors.province ? 'province-error' : undefined}>
                <option value="">Select {provinceLabel.toLowerCase()}</option>
                {provinceOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="province"
                name="province"
                type="text"
                className={styles.input}
                value={formData.province}
                onChange={(event) => updateField('province', event.target.value)}
                placeholder={`Enter ${provinceLabel.toLowerCase()}`}
                aria-invalid={Boolean(errors.province)}
                aria-describedby={errors.province ? 'province-error' : undefined}
              />
            )}
            {errors.province ? (
              <p id="province-error" className={styles.fieldError} role="alert">
                {errors.province}
              </p>
            ) : null}
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="postalCode" className={styles.label}>
            {formData.country === 'US' ? 'ZIP code' : 'Postal code'}
          </label>
          <input
            id="postalCode"
            name="postalCode"
            type="text"
            autoComplete="postal-code"
            className={styles.input}
            value={formData.postalCode}
            onChange={(event) => updateField('postalCode', event.target.value)}
            placeholder={formData.country === 'CA' ? 'A1A 1A1' : formData.country === 'US' ? '12345' : ''}
            aria-invalid={Boolean(errors.postalCode)}
            aria-describedby={errors.postalCode ? 'postalCode-error' : undefined}
          />
          {errors.postalCode ? (
            <p id="postalCode-error" className={styles.fieldError} role="alert">
              {errors.postalCode}
            </p>
          ) : null}
        </div>

        <div className={styles.checkboxColumn}>
          <label className={styles.checkboxLabel} htmlFor="acceptTerms">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              className={styles.checkbox}
              checked={formData.acceptTerms}
              onChange={(event) => updateField('acceptTerms', event.target.checked)}
              aria-invalid={Boolean(errors.acceptTerms)}
              aria-describedby={errors.acceptTerms ? 'acceptTerms-error' : undefined}
            />
            <span>I agree to the terms and privacy policy.</span>
          </label>
          {errors.acceptTerms ? (
            <p id="acceptTerms-error" className={styles.fieldError} role="alert">
              {errors.acceptTerms}
            </p>
          ) : null}

          <label className={styles.checkboxLabel} htmlFor="marketingOptIn">
            <input
              id="marketingOptIn"
              name="marketingOptIn"
              type="checkbox"
              className={styles.checkbox}
              checked={formData.marketingOptIn}
              onChange={(event) => updateField('marketingOptIn', event.target.checked)}
            />
            <span>Send me occasional product updates.</span>
          </label>
        </div>
      </>
    );
  };

  return (
    <main className={styles.page} suppressHydrationWarning>
      <section className={styles.card} aria-labelledby="signup-title">
        <header className={styles.header}>
          <h1 id="signup-title" className={styles.title}>
            Create your account
          </h1>
          <p className={styles.subtitle}>Step {step} of 3</p>

          <div className={styles.progressWrap} aria-hidden>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${STEP_PERCENTAGES[step - 1]}%` }} />
            </div>
            <p className={styles.progressPercent}>{STEP_PERCENTAGES[step - 1]}%</p>
          </div>

          <ol className={styles.stepper}>
            {STEP_LABELS.map((label, index) => {
              const stepIndex = index + 1;
              const statusClass =
                stepIndex === step ? styles.stepCurrent : stepIndex < step ? styles.stepDone : styles.stepUpcoming;

              return (
                <li key={label} className={`${styles.stepItem} ${statusClass}`}>
                  <span className={styles.stepDot}>{stepIndex}</span>
                  <span>{label}</span>
                </li>
              );
            })}
          </ol>
        </header>

        {formError ? (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        ) : null}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {renderStep()}

          <div className={styles.actions}>
            <button type="button" className={styles.secondaryButton} onClick={handleBack} disabled={step === 1 || isSubmitting}>
              Back
            </button>

            {step < 3 ? (
              <button type="button" className={styles.primaryButton} onClick={handleNext} disabled={isSubmitting}>
                Next
              </button>
            ) : (
              <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            )}
          </div>
        </form>

        <p className={styles.footerText}>
          Already have an account?{' '}
          <Link href="/login" className={styles.textLink}>
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
