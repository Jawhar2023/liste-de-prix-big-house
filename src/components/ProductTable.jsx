import { useState } from 'react'
import { Pencil, Trash2, X, ZoomIn } from 'lucide-react'

function formatPrice(price) {
  if (price === 0 || price == null) return '—'
  return `${Number(price).toFixed(price % 1 === 0 ? 0 : 2)} TND`
}

function ProductImage({ src, name, size = 'md', onZoom }) {
  const sizes = {
    md: 'h-28 w-28 sm:h-32 sm:w-32',
    lg: 'h-36 w-36 sm:h-40 sm:w-40',
  }

  return (
    <button
      type="button"
      disabled={!src}
      onClick={() => src && onZoom?.(src, name)}
      className={`group relative flex ${sizes[size]} shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-brand-brown/10 shadow-sm transition hover:ring-brand-gold/50 disabled:cursor-default`}
    >
      {src ? (
        <>
          <img
            src={src}
            alt={name}
            className="h-full w-full object-contain p-2"
            loading="lazy"
          />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-brand-brown-deep/0 opacity-0 transition group-hover:bg-brand-brown-deep/35 group-hover:opacity-100">
            <ZoomIn className="h-6 w-6 text-brand-gold-bright" />
          </span>
        </>
      ) : (
        <span className="text-xs font-medium text-brand-muted">N/A</span>
      )}
    </button>
  )
}

function ImageLightbox({ src, name, onClose }) {
  if (!src) return null
  return (
    <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div className="animate-fade-up relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-brand-sand px-4 py-3">
          <p className="truncate font-display text-base font-bold text-brand-brown-deep">
            {name}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-brand-muted hover:bg-brand-sand"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center justify-center bg-brand-cream p-4 sm:p-6">
          <img
            src={src}
            alt={name}
            className="max-h-[70vh] w-full object-contain"
          />
        </div>
      </div>
    </div>
  )
}

export default function ProductTable({ products, isAdmin, onEdit, onDelete }) {
  const [zoom, setZoom] = useState(null)

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-hidden rounded-2xl border border-brand-brown/10 bg-white/90 shadow-lg shadow-brand-brown/5 md:block">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-brand-brown-deep text-brand-gold-soft">
                <th className="px-4 py-3.5 font-display text-xs font-semibold uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3.5 font-display text-xs font-semibold uppercase tracking-wider">
                  Photo
                </th>
                <th className="px-4 py-3.5 font-display text-xs font-semibold uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-4 py-3.5 font-display text-xs font-semibold uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-4 py-3.5 font-display text-xs font-semibold uppercase tracking-wider">
                  Prix
                </th>
                {isAdmin && (
                  <th className="px-4 py-3.5 font-display text-xs font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr
                  key={p.id}
                  className={`table-row-hover border-t border-brand-sand transition ${
                    i % 2 === 0 ? 'bg-white' : 'bg-brand-cream/50'
                  }`}
                >
                  <td className="px-4 py-4 font-mono text-xs text-brand-muted">
                    #{String(p.id).padStart(3, '0')}
                  </td>
                  <td className="px-4 py-4">
                    <ProductImage
                      src={p.image}
                      name={p.name}
                      size="lg"
                      onZoom={(src, name) => setZoom({ src, name })}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-base font-semibold text-brand-brown-deep">
                      {p.name}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-lg bg-brand-sand px-2.5 py-1 text-xs font-medium text-brand-brown-soft">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="price-chip inline-flex rounded-lg px-2.5 py-1 text-sm">
                      {formatPrice(p.price)}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-4">
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(p)}
                          className="rounded-lg p-2 text-brand-brown-soft hover:bg-brand-sand"
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(p)}
                          className="rounded-lg p-2 text-red-700/80 hover:bg-red-50"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="space-y-3 md:hidden">
        <div className="flex items-center gap-3 rounded-xl bg-brand-brown-deep px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-brand-gold-soft">
          <span className="w-8">ID</span>
          <span className="flex-1">Produit</span>
          <span className="w-20 text-right">Prix</span>
        </div>

        {products.map((p) => (
          <article
            key={p.id}
            className="overflow-hidden rounded-2xl border border-brand-brown/10 bg-white/95 shadow-sm shadow-brand-brown/5"
          >
            <div className="flex gap-3.5 p-3.5">
              <ProductImage
                src={p.image}
                name={p.name}
                size="md"
                onZoom={(src, name) => setZoom({ src, name })}
              />
              <div className="min-w-0 flex-1 self-center">
                <p className="font-mono text-[10px] text-brand-muted">
                  #{String(p.id).padStart(3, '0')}
                </p>
                <h3 className="mt-0.5 font-display text-[15px] font-bold leading-snug text-brand-brown-deep">
                  {p.name}
                </h3>
                <p className="mt-2 inline-flex rounded-md bg-brand-sand px-2 py-0.5 text-[11px] font-medium text-brand-brown-soft">
                  {p.category}
                </p>
                <div className="mt-2.5">
                  <span className="price-chip inline-flex rounded-lg px-2.5 py-1 text-sm">
                    {formatPrice(p.price)}
                  </span>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="flex border-t border-brand-sand">
                <button
                  type="button"
                  onClick={() => onEdit(p)}
                  className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-brand-brown-soft hover:bg-brand-cream"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Modifier
                </button>
                <div className="w-px bg-brand-sand" />
                <button
                  type="button"
                  onClick={() => onDelete(p)}
                  className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-red-700/80 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Supprimer
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      <ImageLightbox
        src={zoom?.src}
        name={zoom?.name}
        onClose={() => setZoom(null)}
      />
    </>
  )
}
