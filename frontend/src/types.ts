export * from './types/index';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  role: 'user' | 'admin' | 'super_admin';
  created_at: string;
  updated_at: string;
}
