
import { z } from "zod";

export const registerSchema = z.object({
    name: z.string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters"),

    email: z.string()
        .trim()
        .email("Please provide a valid email address")
        .max(254, "Email cannot exceed 254 characters")
        .transform((email) => email.toLowerCase()),

    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(72, "Password cannot exceed 72 characters")
        .refine(
          (password) => Buffer.byteLength(password, "utf8") <= 72,
          "Password cannot exceed 72 bytes"
        ),

    phone: z.string()
        .trim()
        .regex(
          /^[6-9]\d{9}$/,
          "Enter a valid 10-digit Indian mobile number"
        )
}).strict();

export const sellerRegisterSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z.string()
    .trim()
    .email("Please provide a valid email address")
    .max(254, "Email cannot exceed 254 characters")
    .transform((email) => email.toLowerCase()),

  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot exceed 72 characters"),

  phone: z.string()
    .trim()
    .min(7, "Phone number must be at least 7 characters")
    .max(20, "Phone number cannot exceed 20 characters"),

  storeName: z.string()
    .trim()
    .min(2, "Store name must be at least 2 characters")
    .max(100, "Store name cannot exceed 100 characters")
}).strict();

export const loginSchema = z.object({
  email: z.string()
    .trim()
    .email("Please provide a valid email address")
    .max(254, "Email cannot exceed 254 characters")
    .transform((email) => email.toLowerCase()),

  password: z.string()
    .min(1, "Password is required")
    .max(72, "Password is too long")
    .refine(
        (password) => Buffer.byteLength(password, "utf8") <= 72,
        "Password cannot exceed 72 bytes"
    )
}).strict();

export const updateProfileSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  phone: z.string()
    .trim()
    .min(7, "Phone number must be at least 7 characters")
    .max(20, "Phone number cannot exceed 20 characters")
}).strict();
