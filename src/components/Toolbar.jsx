import {
  Download,
  Lock,
  LockOpen,
  Plus,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'

export default function Toolbar({
  search,
  setSearch,
  category,
  setCategory,
  categories,
  isAdmin,
  onToggleAdmin,
  onAdd,
  onReset,
  onDownloadPdf,
  pdfBusy,
  count,
  total,
}) {
  return (
    <div className="animate-fade-up sticky top-0 z-30 -mx-1 space-y-3 px-1 py-2 backdrop-blur-md">
      <div className="flex flex-col gap-3 rounded-2xl border border-brand-brown/10 bg-white/85 p-3 shadow-lg shadow-brand-brown/5 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-display text-lg font-bold text-brand-brown-deep">
              Catalogue
            </p>
            <p className="text-xs text-brand-muted sm:text-sm">
              {count} produit{count > 1 ? 's' : ''}
              {count !== total ? ` sur ${total}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={onDownloadPdf}
                  disabled={pdfBusy || count === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-brand-gold/40 bg-white px-3 py-2 text-sm font-semibold text-brand-brown-deep shadow-sm transition hover:bg-brand-gold-bright/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  title="Télécharger la liste de prix en PDF"
                >
                  <Download className={`h-4 w-4 ${pdfBusy ? 'animate-pulse' : ''}`} />
                  <span className="hidden sm:inline">
                    {pdfBusy ? 'PDF…' : 'PDF'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onAdd}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gold-bright px-3 py-2 text-sm font-semibold text-brand-brown-deep shadow-md shadow-brand-gold/30 transition hover:brightness-105 active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-brand-brown/15 bg-brand-sand px-3 py-2 text-sm font-medium text-brand-brown-soft transition hover:bg-brand-cream"
                  title="Restaurer la liste d'origine"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Réinitialiser</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onToggleAdmin}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition active:scale-[0.98] ${
                isAdmin
                  ? 'admin-bar text-brand-gold-soft shadow-md'
                  : 'border border-brand-brown/15 bg-white text-brand-brown-soft hover:border-brand-gold/40'
              }`}
            >
              {isAdmin ? (
                <>
                  <LockOpen className="h-4 w-4" />
                  Mode admin
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Admin
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit…"
              className="w-full rounded-xl border border-brand-brown/10 bg-brand-cream py-2.5 pl-10 pr-9 text-sm outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-brand-muted hover:bg-brand-sand"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-brand-brown/10 bg-brand-cream px-3 py-2.5 text-sm outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 sm:min-w-[220px]"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
