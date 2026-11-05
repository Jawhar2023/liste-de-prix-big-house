import { useCallback, useEffect, useMemo, useState } from 'react'
import seedProducts from '../data/products.json'

const STORAGE_KEY = 'bighouse-products-v1'
const ADMIN_KEY = 'bighouse-admin-mode'

function loadProducts() {
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
  const [products, setProducts] = useState(loadProducts)
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem(ADMIN_KEY) === '1')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem(ADMIN_KEY, isAdmin ? '1' : '0')
  }, [isAdmin])

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean))
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'))
  }, [products])

  const toggleAdmin = useCallback(() => setIsAdmin((v) => !v), [])

  const addProduct = useCallback((product) => {
    setProducts((prev) => {
      const nextId = prev.reduce((max, p) => Math.max(max, p.id), 0) + 1
      return [{ ...product, id: nextId }, ...prev]
    })
  }, [])

  const updateProduct = useCallback((id, patch) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch, id: p.id } : p))
    )
  }, [])

  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const resetProducts = useCallback(() => {
    setProducts(seedProducts.map((p) => ({ ...p })))
  }, [])

  return {
    products,
    categories,
    isAdmin,
    toggleAdmin,
    setIsAdmin,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProducts,
  }
}
