const fs = require('fs')
const path = require('path')

const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/products.json'), 'utf8')
)

function esc(s) {
  if (s == null) return 'NULL'
  return "'" + String(s).replace(/'/g, "''") + "'"
}

const lines = []
lines.push('-- Big House seed — run AFTER schema.sql in Supabase SQL Editor')
lines.push('-- Truncates then inserts the ordered catalogue')
lines.push('truncate table public.products restart identity cascade;')
lines.push('')
lines.push(
  'insert into public.products (name, slug, category, price, image_url, sort_order) values'
)

const values = products.map((p, i) => {
  const img = p.image ? esc(p.image) : 'NULL'
  return `  (${esc(p.name)}, ${esc(p.slug)}, ${esc(p.category)}, ${Number(p.price) || 0}, ${img}, ${i + 1})`
})

lines.push(values.join(',\n') + ';')
lines.push('')
lines.push('select count(*) as product_count from public.products;')

const out = path.join(__dirname, '../supabase/seed.sql')
fs.writeFileSync(out, lines.join('\n'))
console.log('Wrote', out, 'with', products.length, 'products')
