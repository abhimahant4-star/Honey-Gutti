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

