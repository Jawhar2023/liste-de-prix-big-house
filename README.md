# Big House — Liste de prix

Dashboard responsive (React + Tailwind + Supabase) pour le catalogue Big House Papeterie.

## Lancer le projet

```bash
cd big-house-dashboard
npm install
npm run dev
```

Ouvrez l’URL affichée (souvent `http://localhost:5173`).

## Supabase (backend)

1. Run `supabase/schema.sql` in the Supabase **SQL Editor**
2. Run `supabase/seed.sql` to import products
3. Create admin user (email + password `tarekadmin`) — see `supabase/README.md`
4. Fill root `.env` with URL + anon key

Admin can then **add / rename / edit price & category / delete / upload photos** — saved in Supabase.

Without env keys, the app still works offline with local data.

## Fonctionnalités

- En-tête société + logo
- Table photo / nom / catégorie / prix (responsive phone)
- Recherche + filtre par catégorie
- Mode Admin (Supabase Auth)
- Upload images vers Storage `product-images`

## Build production

```bash
npm run build
npm run preview
```
