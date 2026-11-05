import { useCallback, useEffect, useMemo, useState } from 'react'
import seedProducts from '../data/products.json'
import {
  isSupabaseConfigured,
  resolveImageUrl,
  supabase,
  uploadProductImage,
} from '../lib/supabase'

const STORAGE_KEY = 'bighouse-products-v4'
const ADMIN_KEY = 'bighouse-admin-mode'

const seedBySlug = new Map(seedProducts.map((p) => [p.slug, p]))

function mapRow(row) {
  const seed = row.slug ? seedBySlug.get(row.slug) : null
  const remote = row.image_url || ''
  // Prefer sanitized local seed paths for /products/* (spaces broke PDF/Vercel)
  // Keep full http(s) URLs from Supabase Storage uploads
  let image = remote
  if (seed?.image) {
    if (!remote || remote.startsWith('/products/')) {
      image = seed.image
    }
  }
  return {
    id: row.id,
    name: row.name,
    slug: row.slug || '',
    category: row.category || '',
    price: Number(row.price) || 0,
    image: resolveImageUrl(image),
    sort_order: row.sort_order,
  }
}

function loadLocalProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch {
    /* ignore */
  }
  return seedProducts.map((p) => ({ ...p }))
}

export function useProducts() {
  const [products, setProducts] = useState(() =>
    isSupabaseConfigured ? [] : loadLocalProducts()
  )
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const fetchProducts = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setProducts(loadLocalProducts())
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    const { data, error: qError } = await supabase
      .from('products')
      .select('id, name, slug, category, price, image_url, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })

    if (qError) {
      setError(qError.message)
      setProducts(loadLocalProducts())
    } else {
      setProducts((data || []).map(mapRow))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Restore admin session from Supabase Auth
  useEffect(() => {
    if (!supabase) {
      setIsAdmin(localStorage.getItem(ADMIN_KEY) === '1')
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setIsAdmin(Boolean(data.session))
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(Boolean(session))
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  // Local-only persistence fallback
  useEffect(() => {
    if (isSupabaseConfigured) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  }, [products])

  useEffect(() => {
    if (isSupabaseConfigured) return
    localStorage.setItem(ADMIN_KEY, isAdmin ? '1' : '0')
  }, [isAdmin])

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean))
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'))
  }, [products])

  const loginAdmin = useCallback(async (password, email) => {
    if (!isSupabaseConfigured || !supabase) {
      if (password === 'tarekadmin') {
        setIsAdmin(true)
        return { ok: true }
      }
      return { ok: false, message: 'Mot de passe incorrect' }
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return { ok: false, message: authError.message || 'Connexion refusée' }
    }
    setIsAdmin(true)
    return { ok: true }
  }, [])

  const logoutAdmin = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    setIsAdmin(false)
  }, [])

  const toggleAdmin = useCallback(() => {
    if (isAdmin) logoutAdmin()
  }, [isAdmin, logoutAdmin])

  const addProduct = useCallback(
    async (product) => {
      if (!isSupabaseConfigured || !supabase) {
        setProducts((prev) => {
          const nextId = prev.reduce((max, p) => Math.max(max, p.id), 0) + 1
          return [{ ...product, id: nextId }, ...prev]
        })
        return { ok: true }
      }

      let imageUrl = product.image || null
      if (product.imageFile) {
        imageUrl = await uploadProductImage(
          product.imageFile,
          product.slug || product.name
        )
      }

      const minSort =
        products.reduce((min, p) => Math.min(min, p.sort_order ?? p.id), 0) || 0

      const { data, error: insertError } = await supabase
        .from('products')
        .insert({
          name: product.name,
          slug: product.slug || null,
          category: product.category,
          price: Number(product.price) || 0,
          image_url: imageUrl,
          sort_order: minSort - 1,
          is_active: true,
        })
        .select('id, name, slug, category, price, image_url, sort_order')
        .single()

      if (insertError) return { ok: false, message: insertError.message }

      setProducts((prev) => [mapRow(data), ...prev])
      return { ok: true }
    },
    [products]
  )

  const updateProduct = useCallback(async (id, patch) => {
    if (!isSupabaseConfigured || !supabase) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch, id: p.id } : p))
      )
      return { ok: true }
    }

    let imageUrl = patch.image
    if (patch.imageFile) {
      imageUrl = await uploadProductImage(
        patch.imageFile,
        patch.slug || patch.name || 'product'
      )
    }

    const payload = {
      name: patch.name,
      slug: patch.slug,
      category: patch.category,
      price: Number(patch.price) || 0,
    }
    if (imageUrl !== undefined) payload.image_url = imageUrl

    const { data, error: updateError } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select('id, name, slug, category, price, image_url, sort_order')
      .single()

    if (updateError) return { ok: false, message: updateError.message }

    setProducts((prev) => prev.map((p) => (p.id === id ? mapRow(data) : p)))
    return { ok: true }
  }, [])

  const deleteProduct = useCallback(async (id) => {
    if (!isSupabaseConfigured || !supabase) {
      setProducts((prev) => prev.filter((p) => p.id !== id))
      return { ok: true }
    }

    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (deleteError) return { ok: false, message: deleteError.message }

    setProducts((prev) => prev.filter((p) => p.id !== id))
    return { ok: true }
  }, [])

  const resetProducts = useCallback(() => {
    if (isSupabaseConfigured) {
      fetchProducts()
      return
    }
    setProducts(seedProducts.map((p) => ({ ...p })))
  }, [fetchProducts])

  return {
    products,
    categories,
    loading,
    error,
    isAdmin,
    isRemote: isSupabaseConfigured,
    loginAdmin,
    logoutAdmin,
    toggleAdmin,
    setIsAdmin,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProducts,
    refresh: fetchProducts,
  }
}
