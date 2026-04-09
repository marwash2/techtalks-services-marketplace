export const ROLES = {
  USER: "user",
  PROVIDER: "provider",
  ADMIN: "admin",
};

export type Role = typeof ROLES[keyof typeof ROLES];