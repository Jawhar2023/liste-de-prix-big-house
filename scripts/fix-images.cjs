const fs = require('fs');
const path = require('path');

const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../parsed-products.json'), 'utf8')
);
const productsDir = path.join(__dirname, '../../products');
const files = fs.readdirSync(productsDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

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
};

function resolveFile(name) {
  return (
    files.find((x) => x === name) ||
    files.find((x) => x.toLowerCase() === name.toLowerCase()) ||
    null
  );
}

let applied = 0;
for (const p of products) {
  if (manual[p.slug]) {
    const real = resolveFile(manual[p.slug]);
    if (real) {
      p.image = `/products/${real}`;
      applied++;
    }
  } else if (p.image) {
    // normalize path for public folder
    p.image = p.image.replace(/^\.\/products\//, '/products/');
  }
}

console.log('manual applied', applied);
console.log('with images', products.filter((p) => p.image).length);
console.log(
  'without',
  products.filter((p) => !p.image).map((p) => p.slug)
);

const outDir = path.join(__dirname, '../src/data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'products.json'),
  JSON.stringify(products, null, 2)
);
fs.writeFileSync(
  path.join(__dirname, '../parsed-products.json'),
  JSON.stringify(products, null, 2)
);
console.log('Wrote src/data/products.json');
