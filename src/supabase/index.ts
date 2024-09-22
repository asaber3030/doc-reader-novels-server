import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET,
  {
    auth: {
      persistSession: false,
    },
  },
);

export default supabase;
