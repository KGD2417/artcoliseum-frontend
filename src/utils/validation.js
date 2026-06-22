/**
 * Reusable form validators for the whole app.
 *
 * Each validator returns an error string (truthy) when the value is invalid,
 * or "" when it's fine. Compose them per-field with `validateForm`.
 *
 *   const rules = {
 *     name:  [required("Name")],
 *     email: [required("Email"), email],
 *     phone: [required("Phone"), phoneIN],
 *   };
 *   const errors = validateForm(values, rules);   // { field: "message", ... }
 *   if (isValid(errors)) submit();
 */

const _s = (v) => (v == null ? "" : String(v)).trim();

export const required = (label = "This field") => (v) =>
  _s(v) ? "" : `${label} is required`;

export const email = (v) =>
  !_s(v) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(_s(v)) ? "" : "Enter a valid email";

// Indian mobile: 10 digits starting 6-9. Strips spaces / +91 / leading 0.
export const phoneIN = (v) => {
  const digits = _s(v).replace(/[\s-]/g, "").replace(/^\+91/, "").replace(/^0/, "");
  if (!digits) return "";
  return /^[6-9]\d{9}$/.test(digits) ? "" : "Enter a valid 10-digit mobile number";
};

export const pincodeIN = (v) =>
  !_s(v) || /^\d{6}$/.test(_s(v)) ? "" : "Enter a valid 6-digit PIN code";

export const minLen = (n, label = "This field") => (v) =>
  !_s(v) || _s(v).length >= n ? "" : `${label} must be at least ${n} characters`;

export const num = (v) =>
  !_s(v) || !Number.isNaN(Number(v)) ? "" : "Enter a valid number";

export const intRange = (min, max, label = "Value") => (v) => {
  if (!_s(v)) return "";
  const n = Number(v);
  if (!Number.isInteger(n)) return `${label} must be a whole number`;
  if (n < min || n > max) return `${label} must be between ${min} and ${max}`;
  return "";
};

export const positive = (label = "Value") => (v) => {
  if (!_s(v)) return "";
  return Number(v) > 0 ? "" : `${label} must be greater than 0`;
};

// Zero or more — rejects negatives (and non-numbers). Empty is allowed.
export const nonNegative = (label = "Value") => (v) => {
  if (!_s(v)) return "";
  const n = Number(v);
  if (Number.isNaN(n)) return `Enter a valid ${label.toLowerCase()}`;
  return n >= 0 ? "" : `${label} cannot be negative`;
};

// Human age — whole number within a sane range. Empty is allowed (optional field).
export const ageRule = (v) => {
  if (!_s(v)) return "";
  const n = Number(v);
  if (!Number.isInteger(n)) return "Age must be a whole number";
  if (n < 16 || n > 100) return "Age must be between 16 and 100";
  return "";
};

// Today or later (compares ISO yyyy-mm-dd date strings).
export const futureDate = (v) => {
  if (!_s(v)) return "";
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(`${_s(v)}T00:00:00`);
  return d >= today ? "" : "Choose today or a later date";
};

/** Run a {field: [validators]} map against values → {field: firstErrorMessage}. */
export function validateForm(values, rules) {
  const errors = {};
  for (const [field, validators] of Object.entries(rules)) {
    for (const fn of validators) {
      const msg = fn(values[field]);
      if (msg) { errors[field] = msg; break; }
    }
  }
  return errors;
}

export const isValid = (errors) => Object.keys(errors).length === 0;

/** Today's date as yyyy-mm-dd, handy for <input type="date" min={todayISO()}>. */
export const todayISO = () => new Date().toISOString().slice(0, 10);

/** A reasonably-unique client id (e.g. for saved-address entries). */
export const genId = (prefix = "id") =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
