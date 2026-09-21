import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("⚠️ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados no .env. Uploads podem falhar.");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
