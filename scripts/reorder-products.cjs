const fs = require('fs')
const path = require('path')

const orderedNames = `
Café d'Or moulu pur 125g
Café d'Or moulu pur sélection 250g
cafe moulu melange 125g
Café premium Uganda 1kg
Café premium Vietnam 1kg
Caffè d'Or espresso 1kg
Saveurs chocolat chaud
Al Kanaa Banane 1L
Al Kanaa Menthe 1L
Al Kanaa Pistachio 1L
El Kanaa Amande 1L
Sirop banane 1L
Sirop caramel 1L
Sirop citron vert 1L
sirop de cranberry 1L
sirop Mandarine 1L
Sirop mangue 1L
Sirop melon 1L
Sirop noisette 1L
Sirop pastèque 1L
Sirop pêche 1L
sirop violette 1L
Dokrem caramel 1L
Dokrem vanille 1L
Fremigel banane 1L
Fremigel blue curaçao 1L
Fremigel caramel 1L
Fremigel chocolat chaud
Fremigel fraise 1L
Fremigel mangue 1L
Fremigel mojito 1L
Fremigel noisette 1L
Fremigel pastèque 1L
Fremigel pêche 1L
Fremigel piña colada 1L
Fremigel roseberry 1L
Fremigel vanille 1L
Fropping caramel
Fropping chocolat noir
Fropping fraise
Fropping framboise
Fropping kiwi
Fropping noisette
Fropping vanille
Fructa banane
Fructa cerise
Fructa douceur de fruits
Fructa kiwi
Fructa mangue
Fructa pêche
Fructa pomme
Puré Saveurs ananas
Puré Saveurs ananas sélection
Puré Saveurs banane
Puré Saveurs cerise
Puré Saveurs framboise
Puré Saveurs fruit de la passion
Puré Saveurs kiwi
Puré Saveurs litchi
Puré Saveurs noix de coco
Puré Saveurs pêche
Puré Saveurs pomme verte
Sauce caramel 2L
Base frappé goût café
Base smoothie neutre
Crème à tartiner pistachio 1kg
Crème à tartiner Bennos 1kg
Crème à tartiner chocolat blanc 1kg
Crème à tartiner Oreo 1kg
Crème à tartiner Rochero 1kg
Crème à tartiner Spéculoos 1kg
Kremy blanc noisette crunchy 1kg
Kremy chocolat blanc 1kg
Kremy chocolat noisette 1kg
kremy cookie creme 1kg
kremy rocher 1kg
kremy speculoos 1kg
Crème caramel
Crème chantilly
Crème chocolat
Crème Dokrem Fropping
Crème fraise
Crème framboise
Crème Kremy chantilly
Crème noisette
Chope vanille 2pcs
Glace Euclase 6pcs
Lait concentré sucré 450g
Mélange de lait concentré 1kg
Miel Saveur du matin
Sweetened Condensed Milk 450g
Assiette White Moon
Big House Premium Drinking Mug
Boîte de conservation en verre
Mug à thé Eduador
Petite tasse
Service Luminarc
Tasse
Tasse en verre
Tasses à thé Brasiliano
Verre à thé Ohio
Verre Antalya
Verre Casual
Verre Glint Lines
Verre In Love
Verre Karma
Verre Luminarc Martigues
Verre Maghrébin
Verre Norvège
Verre Ribello Lines
Verre Ruya
Verre Sicilly
Verre Venezia
Verre Zaru Coffee
Verres Executives
Verres Tumblers
Verres Tumblers Ribbed
Chicha bleue
Chicha Gold
Chicha Purple
Chicha Red
Charbon de coco
Embouts bouche
Embouts chicha
Fahm Safinet
Luxado Barouk
Luxado Black
Luxado Cire épilation
Luxado Cire épilation Vera
Luxado Eau de parfum
Luxado Gel coiffant
Luxado Hair Wax
Luxado Homme
Luxado Masque argile verte
Luxado Miel Cire épilation
Luxado Miel Hydratante
Luxado Nourishing Jelly
Luxado Petroleum Jelly
Luxado Petroleum Jelly 2
Luxado Rose
Luxado Rose Cire épilation
Dumax Bergamote pm
Dumax Cyprès pm
Dumax Fraîcheur gm
Dumax Miel gm
Dumax Violette pm
Elegant Papier
Faracha Papier
Incoped Green 10p
Incoped Pant Blue
Incoped Pant Green
Incoped Pant Purple
Joker Papier
Kotis Baby Lingette
Lilas Brosse à dents
Lilas Dentifrice
Lilas Déodorant Extreme Exotique
Lilas Déodorant Extreme Fruité
Lilas Déodorant Extreme Vanille
Lilas Déodorant Supreme
Lilas Gel lavant Bergamote
Lilas Gel lavant Citron
Lilas Gel lavant Fruité
Lilas Gel lavant Marine
Lilas Lingette
Lilas Lingette bébé
Lilas Nett
Lilas Nett Blue
Lilas Papier Fleurie
Lilas Papillon
Lilas Protect 14p
Lilas Protect Large
Orlena Original
Tapis de toilette 1m
Tapis de toilette 1m
Ultradoux Papier Narcisse
Aura Fraîcheur Blue
Aura Fraîcheur Rose
Aura Fraîcheur Vert
Tablier argenté
Tablier marron pro plus
Tablier marron professionnel
Tablier plastique
Tablier rouge professionnel
Tablier vert
Filet à cheveux tissé
Gants en vinyle
Garanty vinyle
Tabliers HDPE jetables
Assiettes en carton
Baroquettes
Barquettes alimentaires
Barquettes aluminium
Boîte à deux compartiments
Boîte carrée
Boîte repas
Bol à salade
Bol kraft
Bol kraft grand
Bols en plastique
Cocotte
Contenants aluminium avec couvercle
Contenants en aluminium
Grande boîte à pizza
Mini boîte à pizza
Mini cocotte
Ramequins en plastique
Yummy Box
Bouteille blanche
Bouteille en plastique
Bouteille jaune
Bouteille noire
Bouteille rouge
Flûtes
Gobelet avec couvercle
Gobelets à dessert
Gobelets à jus
Gobelets café 1
Gobelets café 2
Gobelets café 3
Gobelets café 4
Gobelets café 5
Gobelets en plastique
Gobelets hexagonaux
Gobelets jetables
Papier cuisson
Sac kraft
Sac kraft grand
Sac kraft moyen
Sac kraft XL
Sac poubelle
Serviettes en papier
Moules cupcakes
Moules en papier
Plateau à gâteau
Plateau gâteau argenté
Plateau gâteau doré
Plateaux pour gâteau
Sous-tarte doré
Sous-tarte doré grand
Couverts en plastique
Cuillères à soupe
Cuillères en plastique
Pailles multicolores
Pailles noires
Pailles zig zag
Petits bâtonnets
Touillettes plastique
Kit de fête
Kit de fête premium
Mini parasols
Nappe de table 1
Nappe de table 2
Nappe de table 3
Nappe de table 4
Nappe de table 5
Nappe de table 6
Nappe de table 7
Nappe de table 8
Nappe de table 9
Nattes en rouleau
Neige en aérosol
Piques décoratives
Rubans scintillants
Briquets
Colle liquide
Sucre en sticks
`
  .trim()
  .split(/\n/)
  .map((s) => s.trim())
  .filter(Boolean)

const priceMap = {
  "Café d'Or moulu pur 125g": 3,
  "Café d'Or moulu pur sélection 250g": 8.5,
  'cafe moulu melange 125g': 3.5,
  'Café premium Uganda 1kg': 38,
  'Café premium Vietnam 1kg': 38,
  "Caffè d'Or espresso 1kg": 34.5,
  'Saveurs chocolat chaud': 21,
  'Al Kanaa Banane 1L': 4.5,
  'Al Kanaa Menthe 1L': 4.5,
  'Al Kanaa Pistachio 1L': 4.5,
  'El Kanaa Amande 1L': 4.5,
  'Sirop banane 1L': 15,
  'Sirop caramel 1L': 15,
  'Sirop citron vert 1L': 15,
  'sirop de cranberry 1L': 15,
  'sirop Mandarine 1L': 15,
  'Sirop mangue 1L': 15,
  'Sirop melon 1L': 15,
  'Sirop noisette 1L': 15,
  'Sirop pastèque 1L': 15,
  'Sirop pêche 1L': 15,
  'sirop violette 1L': 15,
  'Dokrem caramel 1L': 13,
  'Dokrem vanille 1L': 13,
  'Fremigel banane 1L': 13,
  'Fremigel blue curaçao 1L': 13,
  'Fremigel caramel 1L': 13,
  'Fremigel chocolat chaud': 21,
  'Fremigel fraise 1L': 13,
  'Fremigel mangue 1L': 13,
  'Fremigel mojito 1L': 13,
  'Fremigel noisette 1L': 13,
  'Fremigel pastèque 1L': 13,
  'Fremigel pêche 1L': 13,
  'Fremigel piña colada 1L': 13,
  'Fremigel roseberry 1L': 13,
  'Fremigel vanille 1L': 13,
  'Fropping caramel': 9,
  'Fropping chocolat noir': 9,
  'Fropping fraise': 9,
  'Fropping framboise': 9,
  'Fropping kiwi': 9,
  'Fropping noisette': 9,
  'Fropping vanille': 9,
  'Fructa banane': 30,
  'Fructa cerise': 30,
  'Fructa douceur de fruits': 35,
  'Fructa kiwi': 30,
  'Fructa mangue': 30,
  'Fructa pêche': 30,
  'Fructa pomme': 30,
  'Puré Saveurs ananas': 35,
  'Puré Saveurs ananas sélection': 35,
  'Puré Saveurs banane': 35,
  'Puré Saveurs cerise': 35,
  'Puré Saveurs framboise': 35,
  'Puré Saveurs fruit de la passion': 35,
  'Puré Saveurs kiwi': 35,
  'Puré Saveurs litchi': 35,
  'Puré Saveurs noix de coco': 35,
  'Puré Saveurs pêche': 35,
  'Puré Saveurs pomme verte': 35,
  'Sauce caramel 2L': 60,
  'Base frappé goût café': 35,
  'Base smoothie neutre': 30,
  'Crème à tartiner pistachio 1kg': 34.5,
  'Crème à tartiner Bennos 1kg': 22,
  'Crème à tartiner chocolat blanc 1kg': 22,
  'Crème à tartiner Oreo 1kg': 22.5,
  'Crème à tartiner Rochero 1kg': 22.5,
  'Crème à tartiner Spéculoos 1kg': 22.5,
  'Kremy blanc noisette crunchy 1kg': 22,
  'Kremy chocolat blanc 1kg': 22,
  'Kremy chocolat noisette 1kg': 26,
  'kremy cookie creme 1kg': 26,
  'kremy rocher 1kg': 26,
  'kremy speculoos 1kg': 26,
  'Crème caramel': 9,
  'Crème chantilly': 16.5,
  'Crème chocolat': 9,
  'Crème Dokrem Fropping': 9,
  'Crème fraise': 9,
  'Crème framboise': 9,
  'Crème Kremy chantilly': 16.5,
  'Crème noisette': 9,
  'Chope vanille 2pcs': 11,
  'Glace Euclase 6pcs': 17,
  'Lait concentré sucré 450g': 8.8,
  'Mélange de lait concentré 1kg': 17,
  'Miel Saveur du matin': 12,
  'Sweetened Condensed Milk 450g': 8.8,
  'Assiette White Moon': 22,
  'Big House Premium Drinking Mug': 45,
  'Boîte de conservation en verre': 35,
  'Mug à thé Eduador': 14,
  'Petite tasse': 15,
  Tasse: 25,
  'Tasses à thé Brasiliano': 18,
  'Verre à thé Ohio': 11,
  'Verre Antalya': 12,
  'Verre Casual': 18,
  'Verre Glint Lines': 12,
  'Verre In Love': 13,
  'Verre Luminarc Martigues': 16,
  'Verre Maghrébin': 13,
  'Verre Norvège': 10,
  'Verre Ribello Lines': 12,
  'Verre Ruya': 9,
  'Verre Sicilly': 16,
  'Verre Venezia': 12,
  'Verre Zaru Coffee': 7,
  'Verres Tumblers': 13,
  'Verres Tumblers Ribbed': 17,
  'Chicha bleue': 125,
  'Chicha Gold': 125,
  'Chicha Purple': 125,
  'Chicha Red': 125,
  'Charbon de coco': 17,
  'Embouts bouche': 2.5,
  'Embouts chicha': 3.5,
  'Fahm Safinet': 2.5,
  'Luxado Barouk': 4.5,
  'Luxado Black': 4.5,
  'Luxado Cire épilation': 7,
  'Luxado Cire épilation Vera': 4.5,
  'Luxado Eau de parfum': 13,
  'Luxado Gel coiffant': 3.5,
  'Luxado Hair Wax': 3.5,
  'Luxado Homme': 15,
  'Luxado Masque argile verte': 4.5,
  'Luxado Miel Cire épilation': 7,
  'Luxado Miel Hydratante': 4.5,
  'Luxado Nourishing Jelly': 3.5,
  'Luxado Petroleum Jelly': 3.5,
  'Luxado Petroleum Jelly 2': 3.5,
  'Luxado Rose': 4.5,
  'Luxado Rose Cire épilation': 7,
  'Dumax Bergamote pm': 3.5,
  'Dumax Cyprès pm': 3.5,
  'Dumax Fraîcheur gm': 6.5,
  'Dumax Miel gm': 6.5,
  'Dumax Violette pm': 3.5,
  'Elegant Papier': 1.5,
  'Faracha Papier': 1.5,
  'Incoped Green 10p': 14.5,
  'Incoped Pant Blue': 18.5,
  'Incoped Pant Green': 18.5,
  'Incoped Pant Purple': 18.5,
  'Joker Papier': 1.5,
  'Kotis Baby Lingette': 4.5,
  'Lilas Brosse à dents': 2.3,
  'Lilas Dentifrice': 3.5,
  'Lilas Déodorant Extreme Exotique': 6.5,
  'Lilas Déodorant Extreme Fruité': 6.5,
  'Lilas Déodorant Extreme Vanille': 6.5,
  'Lilas Déodorant Supreme': 6.5,
  'Lilas Gel lavant Bergamote': 3.5,
  'Lilas Gel lavant Citron': 3.5,
  'Lilas Gel lavant Fruité': 3.5,
  'Lilas Gel lavant Marine': 3.5,
  'Lilas Lingette': 1.5,
  'Lilas Lingette bébé': 5.8,
  'Lilas Nett': 2.8,
  'Lilas Nett Blue': 3.5,
  'Lilas Papier Fleurie': 3.3,
  'Lilas Papillon': 3.5,
  'Lilas Protect 14p': 28.5,
  'Lilas Protect Large': 28.5,
  'Orlena Original': 18,
  'Tapis de toilette 1m': 9.9,
  'Ultradoux Papier Narcisse': 3.3,
  'Aura Fraîcheur Blue': 6.5,
  'Aura Fraîcheur Rose': 6.5,
  'Aura Fraîcheur Vert': 6.5,
  'Tablier argenté': 8,
  'Tablier marron pro plus': 12,
  'Tablier marron professionnel': 10,
  'Tablier plastique': 2,
  'Tablier rouge professionnel': 8,
  'Tablier vert': 10,
  'Filet à cheveux tissé': 9,
  'Gants en vinyle': 12.5,
  'Garanty vinyle': 13.5,
  'Tabliers HDPE jetables': 17,
  'Grande boîte à pizza': 14.5,
  'Mini boîte à pizza': 13,
  'Gobelets à jus': 5,
  'Papier cuisson': 2.5,
  'Cuillères à soupe': 12.5,
  'Pailles multicolores': 1.5,
  'Pailles noires': 1.5,
  'Pailles zig zag': 2.5,
  'Petits bâtonnets': 2.5,
  'Touillettes plastique': 2.5,
  'Nappe de table 3': 5,
  'Nappe de table 4': 11,
  'Nappe de table 5': 15,
  Briquets: 0.6,
  'Colle liquide': 0.25,
}

function norm(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[''`]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const productsPath = path.join(__dirname, '../src/data/products.json')
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'))

const byNorm = new Map()
for (const p of products) {
  const key = norm(p.name)
  if (!byNorm.has(key)) byNorm.set(key, [])
  byNorm.get(key).push(p)
}

const used = new Set()
const ordered = []
const missing = []
const tapisCount = { used: 0 }

for (const name of orderedNames) {
  const key = norm(name)
  const candidates = byNorm.get(key) || []

  // special case: two "Tapis de toilette 1m"
  let match = null
  if (key === norm('Tapis de toilette 1m')) {
    match = candidates[tapisCount.used] || null
    tapisCount.used++
  } else {
    match = candidates.find((p) => !used.has(p.id)) || null
  }

  // fuzzy fallback: starts with / includes
  if (!match) {
    for (const p of products) {
      if (used.has(p.id)) continue
      const pn = norm(p.name)
      if (pn === key || pn.includes(key) || key.includes(pn)) {
        match = p
        break
      }
    }
  }

  if (!match) {
    missing.push(name)
    continue
  }

  used.add(match.id)
  const next = { ...match }
  const priceKey = Object.keys(priceMap).find((k) => norm(k) === key)
  if (priceKey != null) next.price = priceMap[priceKey]
  // keep nicer display name from ordered list when useful
  next.name = name
    .split(/\s+/)
    .map((w, i) => {
      const small = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'en', 'a', 'à', 'et', "d'", 'l'])
      const lower = w.toLowerCase()
      if (i > 0 && small.has(lower)) return lower
      if (/^\d/.test(w)) return w
      return w.charAt(0).toUpperCase() + w.slice(1)
    })
    .join(' ')
  ordered.push(next)
}

const leftovers = products.filter((p) => !used.has(p.id))

const finalList = [...ordered, ...leftovers].map((p, i) => ({
  ...p,
  id: i + 1,
}))

fs.writeFileSync(productsPath, JSON.stringify(finalList, null, 2))

console.log('Ordered matched:', ordered.length)
console.log('Leftovers appended:', leftovers.length)
console.log('Total:', finalList.length)
console.log('Missing from catalog:', missing)
if (leftovers.length) {
  console.log(
    'Leftover names:',
    leftovers.map((p) => p.name)
  )
}
