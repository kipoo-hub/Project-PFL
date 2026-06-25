import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qggrjxcpwwgyngudcueb.supabase.co";
const supabaseKey = "sb_publishable_qE1yN-RqfPPR-QpF_KpmeA_cYq89G3s";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);