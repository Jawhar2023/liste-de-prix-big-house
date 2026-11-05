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

async function loadLogoDataUrl() {
  try {
    const res = await fetch('/logo.jpg')
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

/**
 * Generate & download the Big House price list PDF.
 * @param {Array} products - products to include (usually filtered list)
 * @param {{ category?: string }} options
 */
export async function exportPriceListPdf(products, options = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 14

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
      /* ignore logo errors */
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
  const rightInfo = [
    COMPANY.address,
    COMPANY.phone,
    COMPANY.email,
    COMPANY.fiscal,
  ]
  rightInfo.forEach((line, i) => {
    doc.text(line, pageW - margin, 12 + i * 4.2, { align: 'right' })
  })

  // Meta line
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
    p.name || '',
    p.category || '',
    formatPrice(p.price),
  ])

  autoTable(doc, {
    startY: y + 9,
    head: [['ID', 'Produit', 'Catégorie', 'Prix']],
    body: rows,
    margin: { left: margin, right: margin },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [28, 18, 12],
      lineColor: [230, 214, 198],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [42, 24, 16],
      textColor: [246, 217, 138],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [250, 246, 241],
    },
    columnStyles: {
      0: { cellWidth: 14, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 48 },
      3: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
    },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages()
      const pageH = doc.internal.pageSize.getHeight()
      doc.setFontSize(7)
      doc.setTextColor(122, 99, 84)
      doc.text(
        `Big House — Liste de prix  |  Page ${data.pageNumber} / ${pageCount}`,
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
