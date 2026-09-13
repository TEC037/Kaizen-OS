import { describe, it, expect } from 'vitest';
import { isValidEmail, sanitizeEmail, isStrongPassword } from './validation';

describe('validation utils', () => {
  describe('isValidEmail', () => {
    it('returns true for valid normal email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });
    it('returns true for valid email with dots', () => {
      expect(isValidEmail('test.name@example.co.uk')).toBe(true);
    });
    it('returns true for valid email with subdomains', () => {
      expect(isValidEmail('user@mail.sub.domain.com')).toBe(true);
    });
    it('returns false for email with spaces', () => {
      expect(isValidEmail('test @example.com')).toBe(false);
    });
    it('returns false for email missing @', () => {
      expect(isValidEmail('testexample.com')).toBe(false);
    });
    it('returns false for email missing domain', () => {
      expect(isValidEmail('test@')).toBe(false);
    });
    it('returns false for single char TLD', () => {
      expect(isValidEmail('test@example.c')).toBe(false);
    });
  });

  describe('sanitizeEmail', () => {
    it('trims whitespace', () => {
      expect(sanitizeEmail('  test@example.com  ')).toBe('test@example.com');
    });
    it('lowercases email', () => {
      expect(sanitizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
    });
    it('trims and lowercases', () => {
      expect(sanitizeEmail('  TeSt@ExAmPlE.cOm  ')).toBe('test@example.com');
    });
  });

  describe('isStrongPassword', () => {
    it('returns valid for strong password', () => {
      const result = isStrongPassword('StrongPass1');
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });
    it('returns invalid if length < 8', () => {
      const result = isStrongPassword('Str1ng');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('La contraseña debe tener al menos 8 caracteres.');
    });
    it('returns invalid if no uppercase', () => {
      const result = isStrongPassword('strongpass1');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('La contraseña debe contener al menos una letra mayúscula.');
    });
    it('returns invalid if no digit', () => {
      const result = isStrongPassword('StrongPassword');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('La contraseña debe contener al menos un número.');
    });
    it('returns invalid for empty string', () => {
      const result = isStrongPassword('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('La contraseña debe tener al menos 8 caracteres.');
    });
  });
});
