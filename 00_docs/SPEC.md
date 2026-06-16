# Specification: Password Validator

This document defines the functional requirements for the `PasswordValidator` module under the BMAD Harness framework.

## 🎯 Product Goals
* Ensure secure password creation by enforcing character complexity requirements.
* Provide clear validation feedback specifying which requirements succeeded or failed.

## 📜 Functional Requirements

- **REQ-001**: The password must have a minimum length of 8 characters.
- **REQ-002**: The password must contain at least one uppercase English letter (A-Z).
- **REQ-003**: The password must contain at least one lowercase English letter (a-z).
- **REQ-004**: The password must contain at least one numerical digit (0-9).
- **REQ-005**: The password must contain at least one special character from the set: `!@#$%^&*()_+-=[]{}|;':",./<>?`.

## 🧪 Acceptance Criteria
- [ ] Returns `isValid: true` if all rules are satisfied.
- [ ] Returns `isValid: false` along with an array of violated requirement IDs (e.g., `['REQ-001']`) if any rule is broken.
