import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const OWNER = {
  name: "Adrien Rippe",
  email: "adrien@belaircamp.org",
  phone: "06 07 60 99 77",
  linkedin: "https://fr.linkedin.com/in/adrien-rippe",
  agenda: "https://meetings-eu1.hubspot.com/arippe?uuid=9d2fc18e-273d-4e71-bb10-dd905e0749d5",
} as const;
