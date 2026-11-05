import { useEffect, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'

const emptyForm = {
  name: '',
  category: '',
  price: '',
  image: '',
}

export default function ProductModal({
  open,
  mode = 'add',
  product,
  categories,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(emptyForm)
  const [preview, setPreview] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && product) {
      setForm({
        name: product.name || '',
        category: product.category || '',
        price: product.price ?? '',
        image: product.image || '',
      })
      setPreview(product.image || '')
    } else {
      setForm(emptyForm)
      setPreview('')
    }
  }, [open, mode, product])

  if (!open) return null

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      setPreview(dataUrl)
      setForm((f) => ({ ...f, image: dataUrl }))
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const name = form.name.trim()
    const category = form.category.trim()
    const price = Number(form.price)
    if (!name || !category || Number.isNaN(price) || price < 0) return

    onSave({
      name,
      category,
      price,
      image: form.image || null,
      slug: name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
    })
    onClose()
  }

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fermer"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="animate-fade-up relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-brand-sand px-5 py-4">
          <h2 className="font-display text-xl font-bold text-brand-brown-deep">
            {mode === 'edit' ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-brand-muted hover:bg-brand-sand"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="scrollbar-thin space-y-4 overflow-y-auto px-5 py-5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-brand-brown/20 bg-brand-cream p-4 transition hover:border-brand-gold"
          >
            {preview ? (
              <img
                src={preview}
                alt="Aperçu"
                className="h-36 w-full rounded-xl object-contain"
              />
            ) : (
              <>
                <ImagePlus className="h-8 w-8 text-brand-gold" />
                <span className="text-sm font-medium text-brand-muted">
                  Ajouter une photo
                </span>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </button>

          <Field label="Nom du produit">
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="field-input"
              placeholder="Ex: Gobelets café"
            />
          </Field>

          <Field label="Catégorie">
            <input
              required
              list="category-list"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              className="field-input"
              placeholder="Ex: Emballages - gobelets"
            />
            <datalist id="category-list">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <Field label="Prix (TND)">
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="field-input"
              placeholder="0.00"
            />
          </Field>
        </div>

        <div className="flex gap-2 border-t border-brand-sand bg-brand-cream/60 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-brand-brown/15 px-4 py-2.5 text-sm font-semibold text-brand-brown-soft"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex-1 rounded-xl bg-brand-brown-deep px-4 py-2.5 text-sm font-semibold text-brand-gold-bright shadow-md transition hover:brightness-110"
          >
            Enregistrer
          </button>
        </div>
      </form>

      <style>{`
        .field-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(59, 36, 22, 0.12);
          background: #faf6f1;
          padding: 0.65rem 0.85rem;
          font-size: 0.925rem;
          outline: none;
        }
        .field-input:focus {
          border-color: #e8a317;
          box-shadow: 0 0 0 3px rgba(232, 163, 23, 0.25);
        }
      `}</style>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
        {label}
      </span>
      {children}
    </label>
  )
}
