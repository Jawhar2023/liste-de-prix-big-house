import { useMemo, useState } from 'react'
import { Loader2, PackageOpen } from 'lucide-react'
import CompanyHeader from './components/CompanyHeader'
import Toolbar from './components/Toolbar'
import ProductTable from './components/ProductTable'
import ProductModal from './components/ProductModal'
import AdminLoginModal from './components/AdminLoginModal'
import { useProducts } from './hooks/useProducts'
import { isSupabaseConfigured } from './lib/supabase'
import { exportPriceListPdf } from './lib/exportPriceListPdf'

export default function App() {
  const {
    products,
    categories,
    loading,
    error,
    isAdmin,
    isRemote,
    loginAdmin,
    logoutAdmin,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProducts,
  } = useProducts()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [modal, setModal] = useState({ open: false, mode: 'add', product: null })
  const [loginOpen, setLoginOpen] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      const matchCat = !category || p.category === category
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        String(p.id).includes(q)
      return matchCat && matchQ
    })
  }, [products, search, category])

  function openAdd() {
    setModal({ open: true, mode: 'add', product: null })
  }

  function openEdit(product) {
    setModal({ open: true, mode: 'edit', product })
  }

  async function handleSave(data) {
    if (modal.mode === 'edit' && modal.product) {
      return updateProduct(modal.product.id, data)
    }
    return addProduct(data)
  }

  async function handleDelete(product) {
    const ok = window.confirm(`Supprimer « ${product.name} » ?`)
    if (!ok) return
    const result = await deleteProduct(product.id)
    if (result && result.ok === false) {
      window.alert(result.message || 'Suppression impossible')
    }
  }

  function handleReset() {
    if (isRemote) {
      resetProducts()
      return
    }
    const ok = window.confirm(
      'Réinitialiser toute la liste avec les données d’origine ? Vos modifications seront perdues.'
    )
    if (ok) resetProducts()
  }

  function handleToggleAdmin() {
    if (!isAdmin) {
      setLoginOpen(true)
    } else {
      logoutAdmin()
    }
  }

  async function handleDownloadPdf() {
    if (!filtered.length || pdfBusy) return
    setPdfBusy(true)
    try {
      await exportPriceListPdf(filtered, { category: category || '' })
    } catch (err) {
      window.alert(err?.message || 'Impossible de générer le PDF')
    } finally {
      setPdfBusy(false)
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-3 pb-10 pt-4 sm:px-5 sm:pt-6">
      <CompanyHeader />

      <main className="mt-5 space-y-4 sm:mt-6">
        <Toolbar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          categories={categories}
          isAdmin={isAdmin}
          onToggleAdmin={handleToggleAdmin}
          onAdd={openAdd}
          onReset={handleReset}
          onDownloadPdf={handleDownloadPdf}
          pdfBusy={pdfBusy}
          count={filtered.length}
          total={products.length}
        />

        {isSupabaseConfigured && (
          <p className="px-1 text-xs text-brand-muted">
            Connecté à Supabase {isRemote ? '✓' : ''}
            {error ? ` — ${error}` : ''}
          </p>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-brand-brown/10 bg-white/70 px-6 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
            <p className="text-sm text-brand-muted">Chargement du catalogue…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-brand-brown/20 bg-white/60 px-6 py-16 text-center">
            <PackageOpen className="h-10 w-10 text-brand-gold" />
            <p className="font-display text-lg font-bold text-brand-brown-deep">
              Aucun produit trouvé
            </p>
            <p className="max-w-sm text-sm text-brand-muted">
              Essayez un autre mot-clé ou changez de catégorie.
            </p>
          </div>
        ) : (
          <ProductTable
            products={filtered}
            isAdmin={isAdmin}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}
      </main>

      <footer className="mt-10 border-t border-brand-brown/10 pt-5 text-center text-xs text-brand-muted">
        © {new Date().getFullYear()} Big House Papeterie — Ariana, Tunisie
      </footer>

      <ProductModal
        open={modal.open}
        mode={modal.mode}
        product={modal.product}
        categories={categories}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        onSave={handleSave}
      />

      <AdminLoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={loginAdmin}
      />
    </div>
  )
}
