import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Check your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface BucketItem {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  added_by: string;
  period: "week" | "month" | "year";
  created_at: string;
  completed_at: string | null;
  updated_at: string;
}

export interface NewBucketItem {
  title: string;
  category: string;
  added_by: string;
  period: "week" | "month" | "year";
}
