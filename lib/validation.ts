import { z } from "zod";

export const checkoutSchema = z.object({
  items: z.array(z.object({ slug: z.string().max(100), qty: z.number().int().min(1).max(10) })).min(1).max(20),
  customer: z.object({
    name: z.string().trim().min(2, "Enter your full name.").max(80),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number."),
    email: z.string().trim().toLowerCase().email("Enter a valid email.").max(120), // required by PayU
    address: z.string().trim().min(8, "Enter your full address.").max(300),
    city: z.string().trim().min(2, "Enter your city.").max(60),
    state: z.string().trim().min(2, "Select your state.").max(60),
    pin: z.string().regex(/^\d{6}$/, "Enter a 6-digit PIN code."),
  }),
});


const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use at most 72 characters.")
  .refine((p) => /[A-Za-z]/.test(p) && /\d/.test(p), "Use letters and at least one number.");

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email.").max(120),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number."),
  password,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email.").max(120),
  password: z.string().min(1, "Enter your password.").max(200),
});

export const forgotSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email.").max(120),
});

export const resetSchema = z
  .object({
    token: z.string().min(20, "This reset link is incomplete.").max(200),
    password,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match." });

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1, "Enter the admin username.").max(100),
  password: z.string().min(1, "Enter the admin password.").max(200),
});

/** Turns zod issues into { field: "message" } for showing under each input. */
export function fieldErrors(issues: { path: (string | number)[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const k = String(i.path[i.path.length - 1] ?? "form");
    out[k] ??= i.message;
  }
  return out;
}

export const postSchema = z.object({
  title: z.string().trim().min(3, "Add a title (at least 3 characters).").max(120, "Keep the title under 120 characters."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Add a web address (at least 3 characters).")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use only small letters, numbers and dashes, e.g. honey-benefits."),
  description: z.string().trim().min(10, "Add a short summary (at least 10 characters).").max(220, "Keep the summary under 220 characters."),
  body: z.string().trim().min(20, "Write the article text (at least 20 characters).").max(50000),
  tags: z.array(z.string().trim().min(1).max(24)).max(6, "Use at most 6 tags.").default([]),
  image: z
    .string()
    .regex(/^\/(api\/blog-image\/[a-f0-9]{24}|images\/[\w.-]+)$/, "Invalid image.")
    .optional()
    .or(z.literal("")),
  imageAlt: z.string().trim().max(150).optional().or(z.literal("")),
  tone: z.enum(["honey", "leaf", "pack"]).default("honey"),
  status: z.enum(["draft", "published"]),
  publishedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date.")
    .optional()
    .or(z.literal("")),
});
export type PostInput = z.infer<typeof postSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email.").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^([6-9]\d{9})?$/, "Enter a 10-digit mobile number, or leave it empty.")
    .optional(),
  message: z.string().trim().min(10, "Write a little more (at least 10 characters).").max(2000, "Keep it under 2000 characters."),
  website: z.string().max(0).optional(), // hidden "honeypot" box: people leave it empty, spam bots fill it
});

const imagePath = z.string().regex(/^\/(api\/blog-image\/[a-f0-9]{24}|images\/[\w.-]+)$/, "Invalid image.");
const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Add a web address (at least 3 characters).")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use only small letters, numbers and dashes, e.g. honey-ghutti.");
const optionalText = (max: number) => z.string().trim().max(max, `Keep it under ${max} characters.`).optional().or(z.literal(""));

/** Admin > Products: add / edit a product. */
export const productSchema = z.object({
  name: z.string().trim().min(2, "Add the product name.").max(100, "Keep the name under 100 characters."),
  slug: slugField,
  hindiName: optionalText(100),
  tagline: z.string().trim().min(3, "Add a short tagline.").max(160, "Keep the tagline under 160 characters."),
  description: z.string().trim().min(10, "Add a description (at least 10 characters).").max(2000, "Keep the description under 2000 characters."),
  price: z.coerce.number({ invalid_type_error: "Enter the price in rupees." }).int("Use whole rupees, e.g. 120.").min(1, "Enter the price in rupees.").max(100000),
  size: z.string().trim().min(1, "Add the pack size, e.g. 100 ml.").max(40),
  images: z.array(imagePath).max(8, "Use at most 8 photos.").default([]),
  badges: z.array(z.string().trim().min(1).max(30, "Keep each badge under 30 characters.")).max(6, "Use at most 6 badges.").default([]),
  ingredients: z
    .array(z.object({ hi: z.string().trim().max(60), latin: z.string().trim().min(1, "Add the ingredient name.").max(80), qty: z.string().trim().max(30) }))
    .max(30)
    .default([]),
  dosage: optionalText(500),
  status: z.enum(["live", "coming_soon", "hidden"]),
  featured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0, "Use 0 or more.").max(9999).default(0),
});
export type ProductInput = z.infer<typeof productSchema>;

/** Quick changes from the products list (status or order only). */
export const productPatchSchema = z
  .object({
    status: z.enum(["live", "coming_soon", "hidden"]).optional(),
    featured: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(9999).optional(),
  })
  .strict()
  .refine((d) => Object.keys(d).length > 0, "Nothing to change.");

/** Admin > Settings */
export const settingsSchema = z.object({
  comingSoonLimit: z.coerce.number().int("Use a whole number.").min(0, "Use 0 to 12.").max(12, "Use 0 to 12."),
  comingSoonTitle: z.string().trim().min(2, "Add a heading.").max(60, "Keep it under 60 characters."),
});
