// src/utils/validation.ts
/**
 * Simple email validation using a regular expression.
 * Returns true if the email matches the pattern, false otherwise.
 */
export function isValidEmail(email: string): boolean {
  // Basic RFC 5322 compatible regex (covers most common cases)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return emailRegex.test(email.trim());
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isStrongPassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'La contraseña debe contener al menos una letra mayúscula.' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: 'La contraseña debe contener al menos un número.' };
  }
  return { valid: true, message: '' };
}
