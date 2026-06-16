/**
 * Validates a password against the security rules.
 * @param {string} password - The password to validate.
 * @returns {{isValid: boolean, errors: string[]}}
 */
function validatePassword(password) {
  const errors = [];
  const safePassword = password || '';

  // REQ-001: Minimum length of 8 characters
  if (safePassword.length < 8) {
    errors.push('REQ-001');
  }

  // REQ-002: At least one uppercase letter (A-Z)
  if (!/[A-Z]/.test(safePassword)) {
    errors.push('REQ-002');
  }

  // REQ-003: At least one lowercase letter (a-z)
  if (!/[a-z]/.test(safePassword)) {
    errors.push('REQ-003');
  }

  // REQ-004: At least one numerical digit (0-9)
  if (!/[0-9]/.test(safePassword)) {
    errors.push('REQ-004');
  }

  // REQ-005: At least one special character
  const specialCharRegex = /[\!@#\$%\^&\*\(\)_\+\-\=\[\]\{\}\|;\':",\.\/<>\?]/;
  if (!specialCharRegex.test(safePassword)) {
    errors.push('REQ-005');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validatePassword
};
