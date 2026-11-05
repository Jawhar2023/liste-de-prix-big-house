# Big House — Liste de prix

Dashboard responsive (React + Tailwind) pour le catalogue Big House Papeterie.

## Lancer le projet

```bash
cd big-house-dashboard
npm install
npm run dev
```

Ouvrez l’URL affichée (souvent `http://localhost:5173`).

## Fonctionnalités

- En-tête société + logo
- Table ID / photo / nom / catégorie / prix (cartes adaptées au mobile)
- Recherche + filtre par catégorie
- **Mode Admin** (bouton Admin, mot de passe : `tarekadmin`) :
  - Ajouter un produit (avec photo)
  - Modifier nom, catégorie, prix, photo
  - Supprimer un produit
  - Réinitialiser la liste d’origine
- Les modifications sont sauvegardées dans `localStorage` du navigateur

## Build production

```bash
npm run build
npm run preview
```
