import { useMemo, useState } from 'react'
import { PackageOpen } from 'lucide-react'
import CompanyHeader from './components/CompanyHeader'
import Toolbar from './components/Toolbar'
import ProductTable from './components/ProductTable'
import ProductModal from './components/ProductModal'
import { useProducts } from './hooks/useProducts'

export default function App() {
  const {
    products,
    categories,
    isAdmin,
    toggleAdmin,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProducts,
  } = useProducts()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [modal, setModal] = useState({ open: false, mode: 'add', product: null })

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

  function handleSave(data) {
    if (modal.mode === 'edit' && modal.product) {
      updateProduct(modal.product.id, data)
    } else {
      addProduct(data)
    }
  }

  function handleDelete(product) {
    const ok = window.confirm(`Supprimer « ${product.name} » ?`)
    if (ok) deleteProduct(product.id)
  }

  function handleReset() {
    const ok = window.confirm(
      'Réinitialiser toute la liste avec les données d’origine ? Vos modifications seront perdues.'
    )
    if (ok) resetProducts()
  }

  function handleToggleAdmin() {
    if (!isAdmin) {
      const pin = window.prompt('Code admin (laissez vide ou entrez: admin)')
      if (pin !== null && (pin === '' || pin.toLowerCase() === 'admin')) {
        toggleAdmin()
      } else if (pin !== null) {
        window.alert('Code incorrect')
      }
    } else {
      toggleAdmin()
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
          count={filtered.length}
          total={products.length}
        />

        {filtered.length === 0 ? (
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
    </div>
  )
}
