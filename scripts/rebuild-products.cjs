const fs = require('fs');
const path = require('path');

const txt = fs.readFileSync(path.join(__dirname, '../../Untitled.txt'), 'utf8');
const productsDir = path.join(__dirname, '../../products');
const files = fs.readdirSync(productsDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

function normalize(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function titleCase(name) {
  const small = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'en', 'a', 'à', 'et', 'd', "d'", 'l']);
  return name
    .split(/\s+/)
    .map((w, i) => {
      const lower = w.toLowerCase();
      if (i > 0 && small.has(lower)) return lower;
      if (/^\d/.test(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}

const fileMap = files.map((f) => ({
  file: f,
  key: normalize(f.replace(/\.(jpe?g|png|webp)$/i, '')),
}));

const synonyms = {
  verre: 'glass',
  verres: 'glass',
  tablier: 'jbad',
  briquets: 'lighters',
  blanche: 'bnac',
  blanc: 'bnac',
  rouge: 'red',
  cuisson: 'cuissante',
  mangue: 'manque',
  cerise: 'cherry',
  peche: 'peach',
  pêche: 'peach',
};

function expandTokens(tokens) {
  const out = new Set(tokens);
  for (const t of tokens) {
    if (synonyms[t]) out.add(synonyms[t]);
  }
  return [...out];
}

function findImage(name, slug) {
  const nameKey = normalize(name);
  const slugKey = normalize(slug.replace(/-/g, ' ').replace(/mw\w+/g, ' '));
  const candidates = [nameKey, slugKey].filter(Boolean);

  for (const c of candidates) {
    const hit = fileMap.find((f) => f.key === c);
    if (hit) return hit.file;
  }

  // strip trailing size tokens like 1l 1kg 125g
  const stripped = candidates.map((c) =>
    c.replace(/\b\d+\s*(l|kg|g|pcs?|p)\b/g, '').replace(/\s+/g, ' ').trim()
  );

  for (const c of stripped) {
    if (!c) continue;
    const hit = fileMap.find((f) => f.key === c || f.key.startsWith(c) || c.startsWith(f.key));
    if (hit && (fIncludesMost(c, hit.key) || hit.key.includes(c.split(' ')[0]))) {
      // require first meaningful token match
      const first = c.split(' ').find((t) => t.length > 2);
      if (first && hit.key.includes(first)) return hit.file;
    }
  }

  let best = null;
  let bestScore = 0;
  for (const c of [...candidates, ...stripped]) {
    if (!c) continue;
    const tokens = expandTokens(c.split(' ').filter((t) => t.length > 2 && !/^\d+$/.test(t)));
    if (!tokens.length) continue;
    for (const f of fileMap) {
      const ft = f.key.split(' ');
      let score = 0;
      for (const t of tokens) {
        if (ft.some((x) => x === t || x.includes(t) || t.includes(x))) score += 1;
      }
      // penalize if first token doesn't match at all
      const first = tokens[0];
      const firstOk = ft.some((x) => x.includes(first) || first.includes(x));
      if (!firstOk) score -= 2;
      if (score > bestScore) {
        bestScore = score;
        best = f.file;
      }
    }
  }

  const minScore = 2;
  if (bestScore >= minScore) return best;
  return null;
}

function fIncludesMost() {
  return true;
}

const manual = {
  briquets: 'lighters.jpg',
  'bouteille-blanc': 'bouteille bnac.jpg',
  'bouteille-rouge': 'bouteille red.jpg',
  'papier-cuisson': 'papier cuissante.jpg',
  'cuilleres-soupe': 'cuiléres a soupe.jpg',
  'tablier-rouge-pro': 'jbad 7mar bro.jpg',
  'tablier-vert': 'jbad a5thar.jpg',
  'tablier-marron-pro': 'jbad bouni bro.jpg',
  'tablier-marron-pro-plus': 'jbad bouni pro.jpg',
  'tablier-plastique': 'jbad plastique.jpg',
  'tablier-silver': 'jbad silver.jpg',
  'boite-bi-compartiment': 'boite bi-comportament.jpg',
  'verre-sicilly': 'glass sicilly.jpg',
  'verre-tumblers': 'glass tumblers.jpg',
  'verre-tumblers-ribbed': 'glass tumblers ribbed.jpg',
  'fructa-cerise': 'fructa cherry.jpg',
  'fructa-peche': 'fructa peach.jpg',
  'fructa-mangue': 'fructa manque.jpg',
  'verre-antalya': 'glass antalya.jpg',
  'verre-casual': 'glass casual.jpg',
  'verre-karma': 'glass karma.jpg',
  'boite-verre-conservation': 'glass food storage.jpg',
  'verre-in-love': 'glass in love.jpg',
  'verre-maghrebin': 'glass maghrebin.jpg',
  'verre-norvege': 'glass norvége.jpg',
  'verre-ribello-lines': 'glass ribrllo lines.jpg',
  'verre-ruya': 'glass ruya.jpg',
  'verre-the-ohio': 'glaass the ohio.jpg',
  'verre-glint-lines': 'glass glint lines.jpg',
  'verre-luminarc-martigues': 'glass luminarc martigues.jpg',
  'verre-venezia': 'glass venezia.jpg',
  'verre-zaru-coffee': 'glass zaru coffee.jpg',
  'mug-the-eduador': 'glass eduador tea mug.jpg',
  'assiette-white-moon': 'plate white moon.jpg',
  'sirop-mangue': 'sirop manque.jpg',
  'fremigel-mangue': 'fremigel manque.jpg',
  'dokrem-vanille': 'dokren vanille.jpg',
  'kremy-speculoos-mw20zvqh-rk7dk': 'créme a tartiner spéculoos.jpg',
  'kremy-rocher-mw212a0g-l6ffp': 'creme a tartiner rochero.jpg',
  'kremy-cookie-creme-mw211ef8-8hd22': 'creme.jpg',
  'mini-box-pizza': 'mini mox pizza.jpg',
  'chicha-bleue': 'chichableue.jpg',
  'chicha-gold': 'chichagold.jpg',
  'chicha-purple': 'chichapurple.jpg',
  'chicha-red': 'chichared.jpg',
  'fremigel-chocolat-chaud': 'fremigel chaucolat chaud.jpg',
  'fremigel-pasteque': 'fremigel pastéque.jpg',
  'fremigel-peche': 'fremigel peche.jpg',
  'creme-kremy-chantilly': 'kremy creme chantitty.jpg',
  'kremy-blanc-noisette-crunchy': 'Kremy Chocolat blanc Noisette Crunchy.jpg',
  'kremy-chocolat-blanc': 'Kremy Chocolat Blanc.jpg',
  'kremy-chocolat-noisette': 'kremy chocolat & Noisette.jpg',
  'base-frappe-cafe': 'smoothie base frappé.jpg',
  'base-smoothie-neutre': 'smoothie base neutre.jpg',
  'base-pistache': 'Smoothie base PISTACHIO.jpg',
  'lait-concentre-sucre': 'lait concentré succré.jpg',
  'lait-concentre-sweetened': 'sweetened condensed milk.jpg',
  'melange-lait-concentre': 'mélange de lait concentré.jpg',
  'tasses-the-brasiliano': 'Tasses.jpg',
  'premium-drinking-mug': 'big house premium drinking mug.jpg',
  'plateau-gateau-4': 'plateau a gateau.jpg',
  'goblets-coffee-2': 'coblets coffet 2.jpg',
  'goblets-plastique-2': 'goblets en plastique.jpg',
  'gobelets-dessert': 'coublets a dessert.jpg',
  'gobelets-jus': 'gobelets.jpg',
  'cuilleres-plastique': 'cuilléres en plastique.jpg',
  'pailles-noires': 'paille noires.jpg',
  'hdpe-disposable': 'hdpe dispsable.jpg',
  'ramequins-plastique': 'ramequibs en plastique.jpg',
  'bol-salade': 'le bol salade.jpg',
  'kit-fete': 'kit de fete.jpg',
  'kit-fete-2': 'kit de fete 2.jpg',
  'cafe-d-or-moulu-pur-mvz5qazp-wqj4w': 'cafe dor moulu pur.jpg',
  'cafe-d-or-moulu-pur-selection-mvz5st2y-1v0v3': "café d'or moulu pur.jpg",
  'caffe-d-or-espresso-mvz5tbt1-od9q1': 'caffe_dor_expresso.jpg',
  'creme-tartiner-oreo': 'créme a tartiner oreo.jpg',
  'creme-tartiner-speculoos': 'créme a tartiner spéculoos.jpg',
  'creme-tartiner-chocolat-blanc': 'creme a tartiner chocolat blanc.jpg',
  'creme-tartiner-bennos': 'créme a tartiner bennos.jpg',
  'creme-tartiner-rochero': 'creme a tartiner rochero.jpg',
  'saveurs-noix-coco': 'saveurs Noix de coco.jpg',
  'saveurs-ananas-selection': 'saveurs ananass.jpg',
  'saveurs-peche': 'saveurs péche.jpg',
  'sirop-pasteque': 'SIROP PASTEQUE.jpg',
  'dumax-bergamote-small': 'dumax-berganote-small-3500.jpg',
  'dumax-violette-small': 'dumax-small-violette-3500.jpg',
  'dumax-cypres-small': 'dumax-cypres-small-3500.jpg',
  'dumax-fraicheur-big': 'dumax-fraicheur-big-4500.jpg',
  'lilas-lingette-blue3 photos': 'lilas-lingette-blue-1500.jpg',
  'lilas-nett-green3 photos': 'lilas-nett-green-2800.jpg',
  'nappe-table-2': 'nappe table 2.jpg',
  'nappe-table-3': 'nappe table 3.jpg',
  'nappe-table-4': 'nappe table 4.jpg',
  'nattes-rouleau': 'nattes en rouleau.jpg',
  'neige-aerosol': 'neige en aérosol.jpg',
  'piques-decoratives': 'piques décoratives.jpg',
  'sous-tarte-dore': 'sous tarte doré.jpg',
  'sous-tarte-dore-2': 'sous tarte doré 2.jpg',
  'moules-papier': 'moules en papier.jpg',
  'moule-papier-2': 'moule en papier 2.jpg',
  'pailles-multicolor': 'pailles multicolor.jpg',
  'pailles-zigzag': 'pailles zig zag.jpg',
  'gobelet-avec-couverture': 'gobelet avec couverture.jpg',
  'goblets-coffee-1': 'coblets coffee 1.jpg',
  'goblets-coffee-4': 'coblets coffee 4.jpg',
  'goblets-coffee-5': 'coblets coffee 5.jpg',
  'goblets-coffee-3': 'goblets coffee 3.jpg',
  'sirop-banane': 'sirop banane.jpg',
  'sirop-caramel': 'sirop caramel.jpg',
  'sirop-citron-vert': 'sirop citron vert.jpg',
  'sirop-melon': 'sirop melon.jpg',
  'sirop-noisette': 'Sirop Noisette.jpg',
  'sirop-peche': 'sirop peche.jpg',
  // no dedicated photos — leave unset
  'sirop-mandarine-mw216x1o-meg70': null,
  'sirop-de-cranberry-mw215nk1-omqt9': null,
  'sirop-violette-mw214kom-we6pm': null,
};

function resolveFile(name) {
  if (!name) return null;
  return (
    files.find((x) => x === name) ||
    files.find((x) => x.toLowerCase() === name.toLowerCase()) ||
    null
  );
}

const lines = txt.split(/\r?\n/);
const products = [];
let i = 0;

while (i < lines.length) {
  while (i < lines.length && !lines[i].trim()) i++;
  if (i >= lines.length) break;
  const name = lines[i++].trim();
  if (!name || name === 'Modifier' || name === 'Supprimer') continue;
  while (i < lines.length && !lines[i].trim()) i++;
  const slug = (lines[i++] || '').trim();
  while (i < lines.length && !lines[i].trim()) i++;
  const category = (lines[i++] || '').trim();
  while (i < lines.length && !lines[i].trim()) i++;

  const nums = [];
  while (i < lines.length && /^\d+(\.\d+)?$/.test(lines[i].trim())) {
    nums.push(parseFloat(lines[i].trim()));
    i++;
  }
  let price = 0;
  if (nums.length >= 3) price = nums[0];
  else if (nums.length === 1) price = nums[0];

  while (i < lines.length) {
    const t = lines[i].trim();
    if (!t) {
      i++;
      continue;
    }
    if (t === 'Modifier' || t === 'Supprimer') {
      i++;
      continue;
    }
    if (/^(New|—|-)/.test(t) || t.includes('\t')) {
      i++;
      continue;
    }
    break;
  }
  while (i < lines.length && /^(Modifier|Supprimer)$/.test(lines[i].trim())) i++;

  let imageFile = null;
  if (Object.prototype.hasOwnProperty.call(manual, slug)) {
    imageFile = resolveFile(manual[slug]);
  } else {
    imageFile = findImage(name, slug);
  }

  products.push({
    id: products.length + 1,
    name: titleCase(name),
    slug,
    category,
    price,
    image: imageFile ? `/products/${imageFile}` : null,
  });
}

const outDir = path.join(__dirname, '../src/data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'products.json'), JSON.stringify(products, null, 2));

console.log('products', products.length);
console.log('with images', products.filter((p) => p.image).length);
console.log(
  'without',
  products.filter((p) => !p.image).map((p) => p.name)
);
