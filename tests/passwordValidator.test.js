const { validatePassword } = require('../src/passwordValidator');

describe('PasswordValidator', () => {
  test('should fail when password has less than 8 characters', () => {
    const result = validatePassword('Short1!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('REQ-001');
  });

  test('should fail when password lacks an uppercase letter', () => {
    const result = validatePassword('lowercase1!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('REQ-002');
  });

  test('should fail when password lacks a lowercase letter', () => {
    const result = validatePassword('UPPERCASE1!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('REQ-003');
  });

  test('should fail when password lacks a digit', () => {
    const result = validatePassword('NoDigits!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('REQ-004');
  });

  test('should fail when password lacks a special character', () => {
    const result = validatePassword('NoSpecial1');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('REQ-005');
  });

  test('should pass when all requirements are satisfied', () => {
    const result = validatePassword('SecureP@ss123');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
