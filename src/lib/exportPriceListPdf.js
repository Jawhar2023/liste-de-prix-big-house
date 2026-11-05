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

// Smaller thumbs = much faster load + smaller PDF
const IMG_W = 12 // mm
const IMG_H = (IMG_W * 16) / 9
const ROW_H = IMG_H + 3
const THUMB_PX_W = 72
const THUMB_PX_H = 128

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

/** Encode path segments so spaces / accents work (e.g. /products/café xxx.jpg) */
function encodeImageUrl(src) {
  if (!src || src.startsWith('data:')) return src
  try {
    if (src.startsWith('http://') || src.startsWith('https://')) {
      const u = new URL(src)
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
      return u.toString()
    }
    // relative path
    return src
      .split('/')
      .map((seg, i) => {
        if (i === 0 && seg === '') return ''
        if (!seg) return ''
        try {
          return encodeURIComponent(decodeURIComponent(seg))
        } catch {
          return encodeURIComponent(seg)
        }
      })
      .join('/')
  } catch {
    return src
  }
}

function bitmapToJpegDataUrl(bitmap, outW, outH) {
  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d', { alpha: false })
  ctx.fillStyle = '#faf6f1'
  ctx.fillRect(0, 0, outW, outH)

  const targetRatio = outW / outH
  const srcRatio = bitmap.width / bitmap.height
  let sx = 0
  let sy = 0
  let sw = bitmap.width
  let sh = bitmap.height
  if (srcRatio > targetRatio) {
    sw = bitmap.height * targetRatio
    sx = (bitmap.width - sw) / 2
  } else {
    sh = bitmap.width / targetRatio
    sy = (bitmap.height - sh) / 2
  }
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, outW, outH)
  if (typeof bitmap.close === 'function') bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.55)
}

async function fetchAsBitmap(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 6000)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      mode: 'cors',
      cache: 'force-cache',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()
    if (!blob.type.startsWith('image/') && blob.type !== 'application/octet-stream') {
      // still try — some servers omit content-type
    }
    return await createImageBitmap(blob)
  } finally {
    clearTimeout(timer)
  }
}

function imageElementToBitmap(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    // same-origin: don't force CORS (avoids tainted canvas failures)
    if (/^https?:\/\//i.test(url) && !url.includes(window.location.host)) {
      img.crossOrigin = 'anonymous'
    }
    const timer = setTimeout(() => {
      img.src = ''
      reject(new Error('timeout'))
    }, 6000)
    img.onload = async () => {
      clearTimeout(timer)
      try {
        resolve(await createImageBitmap(img))
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = () => {
      clearTimeout(timer)
      reject(new Error('img error'))
    }
    img.src = url
  })
}

async function loadImageAsJpeg(src, outW = THUMB_PX_W, outH = THUMB_PX_H) {
  if (!src) return null

  const candidates = []
  const encoded = encodeImageUrl(src)
  candidates.push(encoded)
  if (encoded !== src) candidates.push(src)

  for (const url of candidates) {
    try {
      const bitmap = await fetchAsBitmap(url)
      return bitmapToJpegDataUrl(bitmap, outW, outH)
    } catch {
      /* try next */
    }
    try {
      const bitmap = await imageElementToBitmap(url)
      return bitmapToJpegDataUrl(bitmap, outW, outH)
    } catch {
      /* try next */
    }
  }
  return null
}

async function loadImagesParallel(urls, { concurrency = 24, onProgress } = {}) {
  const results = new Array(urls.length).fill(null)
  let done = 0
  let next = 0

  async function worker() {
    while (next < urls.length) {
      const i = next++
      results[i] = await loadImageAsJpeg(urls[i])
      done++
      if (onProgress) onProgress(done, urls.length)
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, urls.length || 1) },
    () => worker()
  )
  await Promise.all(workers)
  return results
}

async function loadLogoDataUrl() {
  return loadImageAsJpeg('/logo.jpg', 160, 160)
}

/**
 * Generate & download Big House price list PDF with product photos.
 */
export async function exportPriceListPdf(products, options = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 12

  if (options.onProgress) options.onProgress(0, products.length)

  const images = await loadImagesParallel(
    products.map((p) => p.image || null),
    {
      concurrency: 28,
      onProgress: options.onProgress,
    }
  )

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
  const loadedCount = images.filter(Boolean).length
  const filterLabel = options.category
    ? `Catégorie : ${options.category}`
    : 'Toutes les catégories'
  doc.text(
    `${filterLabel}  •  ${products.length} produits  •  ${loadedCount} photos  •  ${formatDateFr()}`,
    margin,
    y + 5
  )

  // Use object rows so image index stays correct across pages
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
    alternateRowStyles: {
      fillColor: [250, 246, 241],
    },
    columnStyles: {
      id: { cellWidth: 12, halign: 'center' },
      photo: { cellWidth: IMG_W + 3.5, halign: 'center' },
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
}
