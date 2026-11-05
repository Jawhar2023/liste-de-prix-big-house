/**
 * Copy every product image to a safe web filename (no spaces/accents)
 * and rewrite products.json image paths.
 */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const productsPath = path.join(root, 'src/data/products.json')
const productsDir = path.join(root, 'public/products')
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'))
const allFiles = fs.readdirSync(productsDir)

function safeBase(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function findFile(original) {
  const direct = path.join(productsDir, original)
  if (fs.existsSync(direct)) return original
  const found = allFiles.find((f) => f.toLowerCase() === original.toLowerCase())
  return found || null
}

const used = new Set()
function uniqueSafe(base, ext) {
  let n = `${base}${ext}`
  let i = 2
  while (used.has(n)) {
    n = `${base}-${i}${ext}`
    i += 1
  }
  used.add(n)
  return n
}

let copied = 0
let updated = 0
const missing = []

for (const p of products) {
  if (!p.image) {
    missing.push(p.name)
    continue
  }

  let original = p.image.replace(/^\/products\//, '')
  try {
    original = decodeURIComponent(original)
  } catch {
    /* keep */
  }

  const real = findFile(original)
  if (!real) {
    missing.push(`${p.name} => ${original}`)
    continue
  }

  let ext = (path.extname(real) || '.jpg').toLowerCase()
  if (ext === '.jpeg') ext = '.jpg'
  const base =
    safeBase(path.basename(real, path.extname(real))) ||
    safeBase(p.slug || p.name) ||
    `product-${p.id}`

  const destName = uniqueSafe(base, ext)
  const destPath = path.join(productsDir, destName)
  const srcFull = path.join(productsDir, real)

  fs.copyFileSync(srcFull, destPath)
  copied += 1

  const next = `/products/${destName}`
  if (p.image !== next) {
    p.image = next
    updated += 1
  }
}

fs.writeFileSync(productsPath, JSON.stringify(products, null, 2))
console.log('copied/ensured', copied)
console.log('updated paths', updated)
console.log('missing', missing.length)
if (missing.length) console.log(missing.slice(0, 30))
console.log('sample', products.slice(0, 5).map((p) => p.image))
