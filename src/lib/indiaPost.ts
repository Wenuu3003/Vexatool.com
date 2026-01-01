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

  const { data, error } = await supabase.functions.invoke<IndiaPostalResponse>(
    "india-postal",
    { body: { query: trimmed } }
  );

  if (error) throw new Error(error.message || "Request failed");
  if (!data) throw new Error("No response from server");
  if (data.error) throw new Error(data.error);

  return Array.isArray(data.results) ? data.results : [];
}

export async function lookupIndiaPostPincode(pincode: string): Promise<ExtendedPinCodeData | null> {
  const pin = PincodeSchema.parse(pincode.trim());
  const results = await searchIndiaPost(pin);
  return results[0] ?? null;
}
