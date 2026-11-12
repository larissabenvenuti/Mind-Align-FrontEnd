export interface PasswordRequirement {
  key: string;
  text: string;
  met: boolean;
}

export function getPasswordRequirements(
  password: string,
): PasswordRequirement[] {
  return [
    {
      key: "length",
      text: "Mínimo de 8 caracteres",
      met: password.length >= 8,
    },
    {
      key: "uppercase",
      text: "Uma letra maiúscula",
      met: /[A-Z]/.test(password),
    },
    {
      key: "lowercase",
      text: "Uma letra minúscula",
      met: /[a-z]/.test(password),
    },
    {
      key: "number",
      text: "Um número",
      met: /\d/.test(password),
    },
    {
      key: "special",
      text: "Um caractere especial (!@#$%...)",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];
}
