import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rqlucgdeuvpkkrbnvjex.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_fLoSYy-c_Q76RxL3nlfb4A_2hcweUta'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common operations
export async function createUser(email: string, username: string, name: string) {
  const { data, error } = await supabase
    .from('users')
    .insert([{ email, username, name }])
    .select()
  return { data, error }
}

export async function getUserByUsername(username: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()
  return { data, error }
}

export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function createPost(userId: string, title: string, content: string) {
  const { data, error } = await supabase
    .from('posts')
    .insert([{ user_id: userId, title, content }])
    .select()
  return { data, error }
}

export async function likePost(postId: string, userId: string) {
  const { data, error } = await supabase
    .from('likes')
    .insert([{ post_id: postId, user_id: userId }])
  return { data, error }
}

export async function createOrder(userId: string, amount: number, paymentMethod: string) {
  const { data, error } = await supabase
    .from('orders')
    .insert([{ user_id: userId, amount, payment_method: paymentMethod, status: 'pending' }])
    .select()
  return { data, error }
}
