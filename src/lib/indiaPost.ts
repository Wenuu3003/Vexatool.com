import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { ExtendedPinCodeData } from "@/data/indianPinCodesExtended";

const MAX_QUERY_LENGTH = 100;

const PostOfficeQuerySchema = z
  .string()
  .trim()
  .min(2, { message: "Please enter at least 2 characters" })
  .max(MAX_QUERY_LENGTH, { message: "Search is too long" });

const PincodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, { message: "PIN code must be 6 digits" });

type IndiaPostalResponse = {
  results?: ExtendedPinCodeData[];
  message?: string;
  error?: string;
};

function isSixDigitPincode(value: string): boolean {
  return /^\d{6}$/.test(value.trim());
}

export async function searchIndiaPost(query: string): Promise<ExtendedPinCodeData[]> {
  const trimmed = query.trim();

  // If user typed digits but not 6 digits, don't call upstream.
  if (/^\d+$/.test(trimmed) && !isSixDigitPincode(trimmed)) return [];

  if (isSixDigitPincode(trimmed)) {
    PincodeSchema.parse(trimmed);
  } else {
    PostOfficeQuerySchema.parse(trimmed);
  }

  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const request = supabase.functions.invoke<IndiaPostalResponse>("india-postal", {
    body: { query: trimmed }, signal: controller.signal,
  });
  const { data, error } = await Promise.race([
    request,
    new Promise<never>((_, reject) => {
      timeout = setTimeout(() => { controller.abort(); reject(new Error("Postal lookup timed out. Please retry.")); }, 20000);
    }),
  ]).finally(() => clearTimeout(timeout));

  if (error) throw new Error(error.message || "Request failed");
  if (!data) throw new Error("No response from server");
  if (data.error) throw new Error(data.error);

  const results = z.array(z.object({
    state: z.string(), district: z.string(), mandal: z.string(),
    village: z.string(), post_office: z.string(), pincode: z.string().regex(/^[1-9]\d{5}$/),
  })).safeParse(data.results);
  if (!results.success) throw new Error("Invalid postal service response");
  return results.data as ExtendedPinCodeData[];
}

export async function lookupIndiaPostPincode(pincode: string): Promise<ExtendedPinCodeData | null> {
  const pin = PincodeSchema.parse(pincode.trim());
  const results = await searchIndiaPost(pin);
  return results[0] ?? null;
}
