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

const IMG_W = 14 // mm in PDF (9:16 portrait)
const IMG_H = (IMG_W * 16) / 9
const ROW_H = IMG_H + 4

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

function loadImageAsJpeg(src, outW = 126, outH = 224) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null)
      return
    }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    const timer = setTimeout(() => resolve(null), 8000)

    img.onload = () => {
      clearTimeout(timer)
      try {
        const canvas = document.createElement('canvas')
        canvas.width = outW
        canvas.height = outH
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#faf6f1'
        ctx.fillRect(0, 0, outW, outH)

        // Cover crop into 9:16
        const targetRatio = outW / outH
        const srcRatio = img.width / img.height
        let sx = 0
        let sy = 0
        let sw = img.width
        let sh = img.height
        if (srcRatio > targetRatio) {
          sw = img.height * targetRatio
          sx = (img.width - sw) / 2
        } else {
          sh = img.width / targetRatio
          sy = (img.height - sh) / 2
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH)
        resolve(canvas.toDataURL('image/jpeg', 0.72))
      } catch {
        resolve(null)
      }
    }

    img.onerror = () => {
      clearTimeout(timer)
      resolve(null)
    }

    img.src = src
  })
}

async function loadImagesInBatches(urls, batchSize = 12) {
  const results = new Array(urls.length).fill(null)
  for (let i = 0; i < urls.length; i += batchSize) {
    const slice = urls.slice(i, i + batchSize)
    const loaded = await Promise.all(slice.map((url) => loadImageAsJpeg(url)))
    loaded.forEach((img, j) => {
      results[i + j] = img
    })
  }
  return results
}

async function loadLogoDataUrl() {
  return loadImageAsJpeg('/logo.jpg', 200, 200)
}

/**
 * Generate & download the Big House price list PDF (with product photos).
 * @param {Array} products
 * @param {{ category?: string, onProgress?: (done: number, total: number) => void }} options
 */
export async function exportPriceListPdf(products, options = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 12

  // Load product images first
  if (options.onProgress) options.onProgress(0, products.length)
  const imageUrls = products.map((p) => p.image || null)
  const images = await loadImagesInBatches(imageUrls, 10)
  if (options.onProgress) options.onProgress(products.length, products.length)

  // Header band
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
  ;[
    COMPANY.address,
    COMPANY.phone,
    COMPANY.email,
    COMPANY.fiscal,
  ].forEach((line, i) => {
    doc.text(line, pageW - margin, 12 + i * 4.2, { align: 'right' })
  })

  let y = 52
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
    `${filterLabel}  •  ${products.length} produit${products.length > 1 ? 's' : ''}  •  ${formatDateFr()}`,
    margin,
    y + 5
  )

  const rows = products.map((p) => [
    String(p.id).padStart(3, '0'),
    '', // photo drawn in didDrawCell
    p.name || '',
    p.category || '',
    formatPrice(p.price),
  ])

  autoTable(doc, {
    startY: y + 9,
    head: [['ID', 'Photo', 'Produit', 'Catégorie', 'Prix']],
    body: rows,
    margin: { left: margin, right: margin, bottom: 14 },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2,
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
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: IMG_W + 4, halign: 'center' },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 40 },
      4: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
    },
    didDrawCell: (data) => {
      if (data.section !== 'body' || data.column.index !== 1) return
      const imgData = images[data.row.index]
      if (!imgData) {
        // empty photo placeholder
        const { x, y: cy, width, height } = data.cell
        doc.setDrawColor(210, 190, 170)
        doc.setFillColor(245, 238, 230)
        const pw = IMG_W
        const ph = IMG_H
        const px = x + (width - pw) / 2
        const py = cy + (height - ph) / 2
        doc.roundedRect(px, py, pw, ph, 1, 1, 'FD')
        return
      }
      try {
        const { x, y: cy, width, height } = data.cell
        const pw = IMG_W
        const ph = IMG_H
        const px = x + (width - pw) / 2
        const py = cy + (height - ph) / 2
        doc.addImage(imgData, 'JPEG', px, py, pw, ph)
      } catch {
        /* skip broken image */
      }
    },
    didDrawPage: (data) => {
      const pageH = doc.internal.pageSize.getHeight()
      // re-draw thin gold line under header only on first page is already done
      doc.setFontSize(7)
      doc.setTextColor(122, 99, 84)
      const pageCount = doc.internal.getNumberOfPages()
      doc.text(
        `Big House — Liste de prix (avec photos)  |  Page ${data.pageNumber}`,
        pageW / 2,
        pageH - 8,
        { align: 'center' }
      )
      // silence unused
      void pageCount
    },
  })

  const stamp = new Date().toISOString().slice(0, 10)
  const catPart = options.category
    ? `-${options.category.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`
    : ''
  doc.save(`liste-de-prix-big-house${catPart}-${stamp}.pdf`)
}
