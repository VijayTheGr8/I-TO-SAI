import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserResponse } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);

// Register (admin API)
export async function register(email: string, password: string) {
  return supabase.auth.admin.createUser({ email, password });
}

// Get user by email (from public users table)
export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  return { data, error };
}

// Create profile after signup
export async function createProfile(userId: string, email: string) {
  return supabase
    .from('profiles')
    .insert([{ id: userId, email }]);
}

// Update responses for a user
export async function updateResponses(userId: string, responses: any) {
  return supabase
    .from('profiles')
    .update({ responses })
    .eq('id', userId);
}