// src/lib/registerValidation.ts

export interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  inviteCode?: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  inviteCode: string;
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateForm(form: RegisterForm): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.name.trim()) {
    errors.name = "Fullt navn er påkrevd";
  } else if (form.name.trim().length < 2) {
    errors.name = "Navn må være minst 2 tegn";
  }

  if (!form.email.trim()) {
    errors.email = "E-post er påkrevd";
  } else if (!validateEmail(form.email)) {
    errors.email = "Ugyldig e-postadresse";
  }

  if (!form.password) {
    errors.password = "Passord er påkrevd";
  } else if (form.password.length < 8) {
    errors.password = "Passordet må være minst 8 tegn";
  } else if (!/[A-Z]/.test(form.password)) {
    errors.password = "Passordet må inneholde minst én stor bokstav";
  } else if (!/[0-9]/.test(form.password)) {
    errors.password = "Passordet må inneholde minst ett tall";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Bekreft passordet ditt";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Passordene stemmer ikke overens";
  }

  if (!form.inviteCode.trim()) {
    errors.inviteCode = "Passkode er påkrevd";
  } else if (form.inviteCode.trim().length < 8) {
    errors.inviteCode = "Passkoden ser ut til å være for kort";
  }

  return errors;
}
