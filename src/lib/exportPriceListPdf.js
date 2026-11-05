import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const COMPANY = {
  name: 'Big House',
  tagline: 'Papeterie & Fournitures',
  address: 'BigHouse, Rue Ibn Khaldoun, Ariana 2050',
  phone: '+216 52 271 887',
  email: 'bighousetunisia@gmail.com',
  fiscal: 'Matricule fiscal : 1992556H/C/N/000',
}

const IMG_W = 13
const IMG_H = (IMG_W * 16) / 9
const ROW_H = IMG_H + 3.5
const THUMB_W = 90
const THUMB_H = 160

function formatPrice(price) {
  if (price === 0 || price == null) return '—'
  const n = Number(price)
  return `${n.toFixed(n % 1 === 0 ? 0 : 2)} TND`
}

function formatDateFr(date = new Date()) {
  return date.toLocaleDateString('fr-TN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function toAbsoluteUrl(src) {
  if (!src) return null
  if (src.startsWith('data:') || src.startsWith('blob:')) return src
  try {
    return new URL(src, window.location.origin).href
  } catch {
    return src
  }
}

function encodePathUrl(absUrl) {
  try {
    const u = new URL(absUrl)
    u.pathname = u.pathname
      .split('/')
      .map((seg) => {
        if (!seg) return ''
        try {
          return encodeURIComponent(decodeURIComponent(seg))
        } catch {
          return encodeURIComponent(seg)
        }
      })
      .join('/')
    return u.href
  } catch {
    return absUrl
  }
}

function collectUrlCandidates(src) {
  if (!src) return []
  const abs = toAbsoluteUrl(src)
  const encoded = encodePathUrl(abs)
  const list = [encoded, abs, src]
  // also try without double-encoding issues
  if (src.startsWith('/')) {
    list.push(`${window.location.origin}${src}`)
    list.push(
      `${window.location.origin}${src
        .split('/')
        .map((s, i) => (i === 0 ? '' : encodeURIComponent(s)))
        .join('/')}`
    )
  }
  return [...new Set(list.filter(Boolean))]
}

function drawCover(ctx, source, outW, outH) {
  ctx.fillStyle = '#faf6f1'
  ctx.fillRect(0, 0, outW, outH)
  const sw = source.width || source.videoWidth
  const sh = source.height || source.videoHeight
  if (!sw || !sh) return
  const targetRatio = outW / outH
  const srcRatio = sw / sh
  let sx = 0
  let sy = 0
  let cw = sw
  let ch = sh
  if (srcRatio > targetRatio) {
    cw = sh * targetRatio
    sx = (sw - cw) / 2
  } else {
    ch = sw / targetRatio
    sy = (sh - ch) / 2
  }
  ctx.drawImage(source, sx, sy, cw, ch, 0, 0, outW, outH)
}

function canvasToJpeg(canvas) {
  return canvas.toDataURL('image/jpeg', 0.62)
}

async function loadViaFetch(url, timeoutMs) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: 'reload',
      credentials: 'same-origin',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()
    let bitmap
    try {
      bitmap = await createImageBitmap(blob)
    } catch {
      // fallback through object URL + Image
      const objUrl = URL.createObjectURL(blob)
      try {
        bitmap = await loadViaImageElement(objUrl, timeoutMs)
      } finally {
        URL.revokeObjectURL(objUrl)
      }
    }
    const canvas = document.createElement('canvas')
    canvas.width = THUMB_W
    canvas.height = THUMB_H
    const ctx = canvas.getContext('2d', { alpha: false })
    drawCover(ctx, bitmap, THUMB_W, THUMB_H)
    if (typeof bitmap.close === 'function') bitmap.close()
    return canvasToJpeg(canvas)
  } finally {
    clearTimeout(timer)
  }
}

function loadViaImageElement(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const isExternal =
      /^https?:\/\//i.test(url) && !url.startsWith(window.location.origin)
    if (isExternal) img.crossOrigin = 'anonymous'

    const timer = setTimeout(() => {
      img.onload = null
      img.onerror = null
      reject(new Error('timeout'))
    }, timeoutMs)

    img.onload = () => {
      clearTimeout(timer)
      try {
        const canvas = document.createElement('canvas')
        canvas.width = THUMB_W
        canvas.height = THUMB_H
        const ctx = canvas.getContext('2d', { alpha: false })
        drawCover(ctx, img, THUMB_W, THUMB_H)
        resolve(canvasToJpeg(canvas))
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = () => {
      clearTimeout(timer)
      reject(new Error('image error'))
    }
    img.src = url
  })
}

/** Try to reuse an already-rendered <img> from the dashboard (most reliable). */
function loadFromDom(src) {
  if (!src) return null
  const imgs = Array.from(document.images || [])
  const match = imgs.find((el) => {
    if (!el.complete || el.naturalWidth < 2) return false
    const s = el.currentSrc || el.src || ''
    return (
      s === src ||
      s.endsWith(src) ||
      decodeURIComponent(s).endsWith(src.replace(/^\//, '')) ||
      (src.startsWith('/') && s.includes(src.split('/').pop()))
    )
  })
  if (!match) return null
  try {
    const canvas = document.createElement('canvas')
    canvas.width = THUMB_W
    canvas.height = THUMB_H
    const ctx = canvas.getContext('2d', { alpha: false })
    drawCover(ctx, match, THUMB_W, THUMB_H)
    return canvasToJpeg(canvas)
  } catch {
    return null
  }
}

async function loadOneImage(src, { timeoutMs = 12000 } = {}) {
  if (!src) return null

  const fromDom = loadFromDom(src)
  if (fromDom) return fromDom

  const candidates = collectUrlCandidates(src)
  for (const url of candidates) {
    try {
      return await loadViaFetch(url, timeoutMs)
    } catch {
      /* next */
    }
    try {
      return await loadViaImageElement(url, timeoutMs)
    } catch {
      /* next */
    }
  }
  return null
}

/**
 * Load all images carefully:
 * 1) parallel pass
 * 2) slow retry pass for failures only
 */
async function loadAllImages(urls, onProgress) {
  const results = new Array(urls.length).fill(null)
  let done = 0
  const bump = () => {
    done += 1
    if (onProgress) onProgress(done, urls.length)
  }

  // Pass 1 — parallel
  const concurrency = 16
  let next = 0
  async function worker() {
    while (next < urls.length) {
      const i = next++
      results[i] = await loadOneImage(urls[i], { timeoutMs: 10000 })
      bump()
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, urls.length || 1) }, () =>
      worker()
    )
  )

  // Pass 2 — retry missing one-by-one (slower, more reliable)
  const failed = []
  for (let i = 0; i < results.length; i++) {
    if (!results[i] && urls[i]) failed.push(i)
  }

  if (failed.length && onProgress) {
    // keep progress at 100% of pass1, then show retry via same counter conceptually
  }

  for (const i of failed) {
    // small pause helps flaky networks / browser limits
    await new Promise((r) => setTimeout(r, 80))
    results[i] = await loadOneImage(urls[i], { timeoutMs: 20000 })
  }

  return results
}

async function loadLogoDataUrl() {
  return loadOneImage('/logo.jpg', { timeoutMs: 8000 })
}

export async function exportPriceListPdf(products, options = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 12

  if (options.onProgress) options.onProgress(0, products.length)

  const images = await loadAllImages(
    products.map((p) => p.image || null),
    options.onProgress
  )

  const loadedCount = images.filter(Boolean).length

  // Header
  doc.setFillColor(42, 24, 16)
  doc.rect(0, 0, pageW, 42, 'F')
  doc.setFillColor(232, 163, 23)
  doc.rect(0, 42, pageW, 2, 'F')

  const logo = await loadLogoDataUrl()
  if (logo) {
    try {
      doc.addImage(logo, 'JPEG', margin, 8, 22, 22)
    } catch {
      /* ignore */
    }
  }

  const textX = logo ? margin + 26 : margin
  doc.setTextColor(255, 184, 0)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(COMPANY.name, textX, 16)

  doc.setTextColor(246, 217, 138)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(COMPANY.tagline, textX, 22)

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.text('LISTE DE PRIX', textX, 29)

  doc.setFontSize(7.5)
  doc.setTextColor(230, 220, 210)
  ;[COMPANY.address, COMPANY.phone, COMPANY.email, COMPANY.fiscal].forEach(
    (line, i) => {
      doc.text(line, pageW - margin, 12 + i * 4.2, { align: 'right' })
    }
  )

  const y = 52
  doc.setTextColor(42, 24, 16)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Catalogue produits', margin, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(122, 99, 84)
  const filterLabel = options.category
    ? `Catégorie : ${options.category}`
    : 'Toutes les catégories'
  doc.text(
    `${filterLabel}  •  ${products.length} produits  •  ${loadedCount}/${products.length} photos  •  ${formatDateFr()}`,
    margin,
    y + 5
  )

  const body = products.map((p, i) => ({
    id: String(p.id).padStart(3, '0'),
    photo: '',
    name: p.name || '',
    category: p.category || '',
    price: formatPrice(p.price),
    _imgIndex: i,
  }))

  autoTable(doc, {
    startY: y + 9,
    columns: [
      { header: 'ID', dataKey: 'id' },
      { header: 'Photo', dataKey: 'photo' },
      { header: 'Produit', dataKey: 'name' },
      { header: 'Catégorie', dataKey: 'category' },
      { header: 'Prix', dataKey: 'price' },
    ],
    body,
    margin: { left: margin, right: margin, bottom: 14 },
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 1.6,
      textColor: [28, 18, 12],
      lineColor: [230, 214, 198],
      lineWidth: 0.2,
      valign: 'middle',
      minCellHeight: ROW_H,
    },
    headStyles: {
      fillColor: [42, 24, 16],
      textColor: [246, 217, 138],
      fontStyle: 'bold',
      fontSize: 8,
      minCellHeight: 8,
      valign: 'middle',
    },
    alternateRowStyles: { fillColor: [250, 246, 241] },
    columnStyles: {
      id: { cellWidth: 12, halign: 'center' },
      photo: { cellWidth: IMG_W + 4, halign: 'center' },
      name: { cellWidth: 'auto' },
      category: { cellWidth: 38 },
      price: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
    },
    didDrawCell: (data) => {
      if (data.section !== 'body' || data.column.dataKey !== 'photo') return
      const idx = data.row.raw?._imgIndex
      const imgData = typeof idx === 'number' ? images[idx] : null
      const { x, y: cy, width, height } = data.cell
      const pw = IMG_W
      const ph = IMG_H
      const px = x + (width - pw) / 2
      const py = cy + (height - ph) / 2

      if (!imgData) {
        doc.setDrawColor(210, 190, 170)
        doc.setFillColor(245, 238, 230)
        doc.roundedRect(px, py, pw, ph, 0.8, 0.8, 'FD')
        return
      }
      try {
        doc.addImage(imgData, 'JPEG', px, py, pw, ph, undefined, 'FAST')
      } catch {
        try {
          doc.addImage(imgData, 'JPEG', px, py, pw, ph)
        } catch {
          /* skip */
        }
      }
    },
    didDrawPage: (data) => {
      const pageH = doc.internal.pageSize.getHeight()
      doc.setFontSize(7)
      doc.setTextColor(122, 99, 84)
      doc.text(
        `Big House — Liste de prix  |  Page ${data.pageNumber}`,
        pageW / 2,
        pageH - 8,
        { align: 'center' }
      )
    },
  })

  const stamp = new Date().toISOString().slice(0, 10)
  const catPart = options.category
    ? `-${options.category.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`
    : ''
  doc.save(`liste-de-prix-big-house${catPart}-${stamp}.pdf`)

  return { total: products.length, withPhotos: loadedCount }
}
