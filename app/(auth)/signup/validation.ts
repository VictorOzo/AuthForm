import { COUNTRY_OPTIONS, PROVINCE_STATE_MAP, type ProvinceOption } from './countries';

export type SignupStep = 1 | 2 | 3;

export type SignupFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneCountry: string;
  phone: string;
  country: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  postalCode: string;
  acceptTerms: boolean;
  marketingOptIn: boolean;
};

export type SignupErrors = Partial<Record<keyof SignupFormData, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const caPostalPattern = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
const usZipPattern = /^\d{5}(-\d{4})?$/;

export function getProvinceOptions(country: string): ProvinceOption[] {
  return PROVINCE_STATE_MAP[country] ?? [];
}

export function getProvinceLabel(country: string): string {
  if (country === 'CA') return 'Province';
  if (country === 'US') return 'State';
  return 'Region';
}

export function formatPhoneInput(rawValue: string, country: string): string {
  if (country === 'CA' || country === 'US') {
    const digits = rawValue.replace(/\D/g, '').slice(0, 10);

    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return rawValue.replace(/[^\d+()\-\s]/g, '');
}

function isPhoneValid(phone: string, country: string): boolean {
  const digits = phone.replace(/\D/g, '');

  if (country === 'CA' || country === 'US') {
    return digits.length === 10;
  }

  return digits.length >= 7;
}

export function normalizePhone(data: Pick<SignupFormData, 'phoneCountry' | 'phone'>): string {
  const trimmedPhone = data.phone.trim();
  const digits = trimmedPhone.replace(/\D/g, '');

  if (!digits) return '';

  if (trimmedPhone.startsWith('+')) {
    return `+${digits}`;
  }

  const callingCode = COUNTRY_OPTIONS.find((option) => option.code === data.phoneCountry)?.callingCode;
  return callingCode ? `${callingCode}${digits}` : digits;
}

export function validateStep(step: SignupStep, data: SignupFormData): SignupErrors {
  const errors: SignupErrors = {};

  if (step === 1) {
    if (!emailPattern.test(data.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    if (data.confirmPassword !== data.password) {
      errors.confirmPassword = 'Passwords do not match.';
    }
  }

  if (step === 2) {
    if (!data.firstName.trim()) {
      errors.firstName = 'First name is required.';
    }

    if (!data.lastName.trim()) {
      errors.lastName = 'Last name is required.';
    }

    if (!data.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!isPhoneValid(data.phone, data.phoneCountry)) {
      errors.phone =
        data.phoneCountry === 'CA' || data.phoneCountry === 'US'
          ? 'Enter a valid 10-digit phone number.'
          : 'Enter a valid phone number with at least 7 digits.';
    }
  }

  if (step === 3) {
    if (!data.address1.trim()) {
      errors.address1 = 'Address line 1 is required.';
    }

    if (!data.city.trim()) {
      errors.city = 'City is required.';
    }

    if (!data.province.trim()) {
      errors.province = `${getProvinceLabel(data.country)} is required.`;
    }

    const postalCode = data.postalCode.trim();
    if (!postalCode) {
      errors.postalCode = 'Postal code is required.';
    } else if (data.country === 'CA' && !caPostalPattern.test(postalCode)) {
      errors.postalCode = 'Enter a valid Canadian postal code (e.g. A1A 1A1).';
    } else if (data.country === 'US' && !usZipPattern.test(postalCode)) {
      errors.postalCode = 'Enter a valid US ZIP code (e.g. 12345 or 12345-6789).';
    } else if (data.country !== 'CA' && data.country !== 'US' && postalCode.length < 3) {
      errors.postalCode = 'Postal code must be at least 3 characters.';
    }

    if (!data.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms to continue.';
    }
  }

  return errors;
}

export function validateAllSteps(data: SignupFormData): SignupErrors {
  return {
    ...validateStep(1, data),
    ...validateStep(2, data),
    ...validateStep(3, data),
  };
}
