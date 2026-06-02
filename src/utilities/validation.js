/**
 * Form and Input Validation Utility
 */

export const validateEmail = (email) => {
  if (!email) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Invalid email address format";
  return null;
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters long";
  // Check for at least one number
  if (!/\d/.test(password)) return "Password must contain at least one number";
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return "Phone number is required";
  // Matches basic international and national formats: e.g., +1234567890, 01712345678, etc.
  const phoneRegex = /^\+?[0-9\s-]{10,15}$/;
  if (!phoneRegex.test(phone)) return "Invalid phone number format";
  return null;
};

export const validateUrl = (url) => {
  if (!url) return "URL is required";
  try {
    new URL(url);
    return null;
  } catch (_) {
    return "Invalid URL format";
  }
};

export const validateNumeric = (value, name = "Field", min = 0, max = Infinity) => {
  if (value === undefined || value === null || value === "") return `${name} is required`;
  const num = Number(value);
  if (isNaN(num)) return `${name} must be a number`;
  if (num < min) return `${name} must be at least ${min}`;
  if (num > max) return `${name} must be at most ${max}`;
  return null;
};

export const validateRequired = (value, name = "Field") => {
  if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
    return `${name} is required`;
  }
  return null;
};

/**
 * Basic XSS sanitization for strings
 */
export const sanitizeInput = (val) => {
  if (typeof val !== "string") return val;
  return val
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};
