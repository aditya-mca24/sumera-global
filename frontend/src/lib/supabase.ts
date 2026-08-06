const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function createMissingSupabaseClient() {
  return new Proxy({}, {
    get() {
      throw new Error(
        'Supabase client is not initialized. Remove any imports from src/lib/supabase.ts or define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      );
    },
  });
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? (() => {
        throw new Error(
          'Supabase is not supported in this frontend build. Please remove src/lib/supabase.ts or provide the necessary environment variables.'
        );
      })()
    : createMissingSupabaseClient();