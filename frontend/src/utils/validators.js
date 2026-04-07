// ── Email Validator ──
export const validateEmail = (email) => {
  const errors = [];

  if (!email) {
    errors.push("Email is required");
    return errors;
  }

  if (/\s/.test(email)) {
    errors.push("Email cannot contain spaces");
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    errors.push("Please enter a valid email (e.g. user@example.com)");
  }

  return errors;
};

// ── Password Validator ──
export const validatePassword = (password) => {
  const rules = [
    {
      id:      "length",
      label:   "At least 8 characters",
      valid:   password.length >= 8,
    },
    {
      id:      "uppercase",
      label:   "At least 1 uppercase letter (A-Z)",
      valid:   /[A-Z]/.test(password),
    },
    {
      id:      "lowercase",
      label:   "At least 1 lowercase letter (a-z)",
      valid:   /[a-z]/.test(password),
    },
    {
      id:      "number",
      label:   "At least 1 number (0-9)",
      valid:   /[0-9]/.test(password),
    },
    {
      id:      "special",
      label:   "At least 1 special character (!@#$%^&*)",
      valid:   /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
    {
      id:      "nospace",
      label:   "No spaces allowed",
      valid:   !/\s/.test(password),
    },
  ];

  return rules;
};

// ── Password Strength ──
export const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: "", color: "" };

  const rules   = validatePassword(password);
  const passed  = rules.filter((r) => r.valid).length;
  const total   = rules.length;
  const percent = Math.round((passed / total) * 100);

  if (percent <= 30) return { strength: percent, label: "Very Weak",  color: "bg-red-500"    };
  if (percent <= 50) return { strength: percent, label: "Weak",       color: "bg-orange-500" };
  if (percent <= 70) return { strength: percent, label: "Medium",     color: "bg-yellow-500" };
  if (percent <= 85) return { strength: percent, label: "Strong",     color: "bg-blue-500"   };
  return               { strength: percent, label: "Very Strong", color: "bg-green-500"  };
};

// ── Name Validator ──
export const validateName = (name) => {
  const errors = [];
  if (!name?.trim())          errors.push("Name is required");
  if (name?.trim().length < 2) errors.push("Name must be at least 2 characters");
  if (/[0-9]/.test(name))    errors.push("Name cannot contain numbers");
  return errors;
};

// ── Check if password is fully valid ──
export const isPasswordValid = (password) => {
  const rules = validatePassword(password);
  return rules.every((r) => r.valid);
};