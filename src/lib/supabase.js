import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export const ADMIN_EMAIL =
  import.meta.env.VITE_ADMIN_EMAIL || 'bighousetunisia@gmail.com'

/** Build a public URL for storage paths or keep absolute / local paths */
export function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null
  if (
    imageUrl.startsWith('http') ||
    imageUrl.startsWith('data:') ||
    imageUrl.startsWith('blob:') ||
    imageUrl.startsWith('/')
  ) {
    return imageUrl
  }
  if (!supabase) return imageUrl
  const { data } = supabase.storage.from('product-images').getPublicUrl(imageUrl)
  return data?.publicUrl || imageUrl
}

export async function uploadProductImage(file, slugHint = 'product') {
  if (!supabase) throw new Error('Supabase non configuré')
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const safeSlug = String(slugHint)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40)
  const path = `${Date.now()}-${safeSlug}.${ext}`

  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw error

  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}
