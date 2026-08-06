declare module 'jsr:@supabase/functions-js/edge-runtime.d.ts' {}

declare module 'jsr:@supabase/supabase-js@2' {
  export interface SupabaseAuthAdminClient {
    deleteUser(userId: string): Promise<{ error: { message: string } | null }>;
  }

  export interface SupabaseClient {
    auth: {
      admin: SupabaseAuthAdminClient;
    };
  }

  export function createClient(url: string, key: string): SupabaseClient;
}

declare const Deno: {
  serve(handler: (req: Request) => Promise<Response> | Response): void;
  env: {
    get(name: string): string | undefined;
  };
};
