const fs = require('fs')
const path = require('path')

const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/products.json'), 'utf8')
)
const dir = path.join(__dirname, '../public/products')
const files = fs.readdirSync(dir)
const filesLower = new Map(files.map((f) => [f.toLowerCase(), f]))

let ok = 0
const missing = []
const caseMismatch = []

for (const p of products) {
  if (!p.image) {
    missing.push({ id: p.id, name: p.name, reason: 'no image field' })
    continue
  }
  let file = p.image.replace(/^\/products\//, '')
  try {
    file = decodeURIComponent(file)
  } catch {
    /* keep */
  }
  const exact = path.join(dir, file)
  if (fs.existsSync(exact)) {
    ok++
    continue
  }
  const ci = filesLower.get(file.toLowerCase())
  if (ci) {
    caseMismatch.push({ id: p.id, name: p.name, wanted: file, actual: ci })
    ok++
    continue
  }
  missing.push({ id: p.id, name: p.name, image: p.image, file })
}

console.log('total', products.length)
console.log('ok', ok)
console.log('caseMismatch', caseMismatch.length)
console.log('missing', missing.length)
if (missing.length) console.log(JSON.stringify(missing, null, 2))
if (caseMismatch.length) console.log('case examples', caseMismatch.slice(0, 10))
