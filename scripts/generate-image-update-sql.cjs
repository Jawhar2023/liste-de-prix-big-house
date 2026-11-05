const fs = require('fs')
const path = require('path')

const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/products.json'), 'utf8')
)

function esc(s) {
  return "'" + String(s).replace(/'/g, "''") + "'"
}

const lines = [
  '-- Update product image_url to safe filenames (run in Supabase SQL Editor)',
  '-- After deploying the new /products/*-safe files to Vercel',
  '',
]

for (const p of products) {
  if (!p.image || !p.slug) continue
  lines.push(
    `update public.products set image_url = ${esc(p.image)} where slug = ${esc(p.slug)};`
  )
}

lines.push('')
lines.push('select count(*) as with_safe_images from public.products where image_url like \'/products/%-%\' or image_url ~ \'^/products/[a-z0-9-]+\\.(jpg|jpeg|png|webp)$\';')

fs.writeFileSync(
  path.join(__dirname, '../supabase/update-image-urls.sql'),
  lines.join('\n')
)
console.log('Wrote update-image-urls.sql', products.length, 'updates')
