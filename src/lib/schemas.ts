import { z } from "zod";

const text = (max: number) => z.string().trim().min(1).max(max);
const phone = z.string().trim().regex(/^[+\d][\d\s-]{7,15}$/, "Enter a valid phone number");

export const inquirySchema = z.object({
  listingId: text(64),
  name: text(80),
  email: z.string().trim().email("Enter a valid email").max(120),
  phone: phone.optional().or(z.literal("")),
  moveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell the provider a little more (10+ characters)").max(1000),
  website: z.string().max(0).optional(), // honeypot: must stay empty
});

export const providerSchema = z.object({
  businessName: text(120),
  category: z.enum(["accommodation", "food", "transport", "essentials"]),
  locality: text(80),
  contactName: text(80),
  email: z.string().trim().email("Enter a valid email").max(120),
  phone,
  services: z.string().trim().min(10, "Describe your services (10+ characters)").max(1500),
  pricing: z.string().trim().min(3, "Add indicative pricing").max(500),
  website: z.string().trim().url("Enter a full URL, e.g. https://…").max(200).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  hp: z.string().max(0).optional(),
});

export type FieldErrors = Record<string, string>;
export function fieldErrors(e: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const i of e.issues) out[String(i.path[0])] ??= i.message;
  return out;
}
