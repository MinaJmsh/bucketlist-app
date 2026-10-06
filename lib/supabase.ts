import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Check your .env file.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// "soon" / "someday" are the new buckets; week/month/year are kept
// so your old rows still type-check
export type Period = "soon" | "someday" | "week" | "month" | "year";

// Database types
export interface BucketItem {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  added_by: string;
  period: Period;
  description: string | null; // new
  photos: string[] | null; // new
  created_at: string;
  completed_at: string | null;
  updated_at: string;
  rating?: number | null;
}

export interface NewBucketItem {
  title: string;
  category: string;
  added_by: string;
  period: Period;
}
