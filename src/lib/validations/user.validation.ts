import { z } from "zod";
import { VALIDATION } from "@/constants/config";

export const createUserSchema = z.object({
  name: z.string()
    .min(VALIDATION.NAME_MIN_LENGTH, "Name too short")
    .max(VALIDATION.NAME_MAX_LENGTH, "Name too long"),
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(VALIDATION.PASSWORD_MIN_LENGTH, "Password must be at least 8 characters"),
  role: z.enum(["user", "provider", "admin"]).optional(),
});

export const updateUserSchema = z.object({
  name: z.string()
    .min(VALIDATION.NAME_MIN_LENGTH)
    .max(VALIDATION.NAME_MAX_LENGTH)
    .optional(),
  email: z.string().email("Invalid email format").optional(),
  role: z.enum(["user", "provider", "admin"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});