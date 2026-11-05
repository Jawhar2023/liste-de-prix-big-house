import { useState } from 'react'
import { Pencil, Trash2, X, ZoomIn } from 'lucide-react'

function formatPrice(price) {
  if (price === 0 || price == null) return '—'
  return `${Number(price).toFixed(price % 1 === 0 ? 0 : 2)} TND`
}

function ProductImage({ src, name, onZoom }) {
  return (
    <button
      type="button"
      disabled={!src}
      onClick={() => src && onZoom?.(src, name)}
      className="group relative aspect-[9/16] w-[72px] shrink-0 overflow-hidden rounded-2xl bg-brand-sand ring-1 ring-brand-brown/10 shadow-sm transition hover:ring-brand-gold/50 disabled:cursor-default sm:w-20"
    >
      {src ? (
        <>
          <img
            src={src}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="lazy"
          />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-brand-brown-deep/0 opacity-0 transition group-hover:bg-brand-brown-deep/35 group-hover:opacity-100">
            <ZoomIn className="h-4 w-4 text-brand-gold-bright" />
          </span>
        </>
      ) : (
        <span className="flex h-full items-center justify-center text-[10px] font-medium text-brand-muted">
          N/A
        </span>
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
      <div className="animate-fade-up relative z-10 flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
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
        <div className="flex items-center justify-center bg-brand-cream p-3">
          <img
            src={src}
            alt={name}
            className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain"
          />
        </div>
      </div>
    </div>
  )
}

function ProductRow({ product: p, isAdmin, onEdit, onDelete, onZoom, striped }) {
  return (
    <div
      className={`table-row-hover flex items-center gap-3 border-b border-brand-sand/80 px-3 py-3.5 sm:gap-5 sm:px-5 sm:py-4 ${
        striped ? 'bg-brand-cream/40' : 'bg-white/90'
      }`}
    >
      <ProductImage
        src={p.image}
        name={p.name}
        onZoom={onZoom}
      />

      <div className="min-w-0 flex-1">
        <p className="font-mono text-[11px] text-brand-muted">
          #{String(p.id).padStart(3, '0')}
        </p>
        <p className="mt-0.5 truncate font-display text-[15px] font-bold text-brand-brown-deep sm:text-lg">
          {p.name}
        </p>
        <span className="mt-1.5 inline-flex rounded-full bg-brand-sand px-2.5 py-0.5 text-[11px] font-medium text-brand-brown-soft sm:hidden">
          {p.category}
        </span>
      </div>

      <span className="hidden shrink-0 rounded-full bg-brand-sand px-3.5 py-1.5 text-sm font-medium text-brand-brown-soft sm:inline-flex">
        {p.category}
      </span>

      <span className="price-chip shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-bold sm:px-3.5 sm:text-sm">
        {formatPrice(p.price)}
      </span>

      {isAdmin && (
        <div className="flex shrink-0 gap-0.5">
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
      )}
    </div>
  )
}

export default function ProductTable({ products, isAdmin, onEdit, onDelete }) {
  const [zoom, setZoom] = useState(null)

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-brand-brown/10 bg-white/90 shadow-lg shadow-brand-brown/5">
        <div className="hidden items-center gap-5 bg-brand-brown-deep px-5 py-3.5 text-brand-gold-soft sm:flex">
          <span className="w-20 font-display text-xs font-semibold uppercase tracking-wider">
            Photo
          </span>
          <span className="flex-1 font-display text-xs font-semibold uppercase tracking-wider">
            Produit
          </span>
          <span className="font-display text-xs font-semibold uppercase tracking-wider">
            Catégorie
          </span>
          <span className="w-24 text-right font-display text-xs font-semibold uppercase tracking-wider">
            Prix
          </span>
          {isAdmin && (
            <span className="w-16 font-display text-xs font-semibold uppercase tracking-wider">
              Actions
            </span>
          )}
        </div>

        {products.map((p, i) => (
          <ProductRow
            key={p.id}
            product={p}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
            onZoom={(src, name) => setZoom({ src, name })}
            striped={i % 2 === 1}
          />
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
