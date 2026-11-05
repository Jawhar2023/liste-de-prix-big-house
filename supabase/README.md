# Supabase setup — Big House

## 1. Run SQL schema

1. Open your Supabase project
2. Go to **SQL Editor → New query**
3. Paste and run [`schema.sql`](./schema.sql)
4. Paste and run [`seed.sql`](./seed.sql) to import the 267 products

## 2. Create the admin user

1. **Authentication → Users → Add user**
2. Email: `bighousetunisia@gmail.com` (or change `VITE_ADMIN_EMAIL`)
3. Password: `tarekadmin`
4. Enable **Auto Confirm User**

Only this authenticated user can **add / edit / delete / rename** products (RLS).

## 3. Connect the React app

Copy Project URL + anon key from **Project Settings → API** into the root `.env`:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_ADMIN_EMAIL=bighousetunisia@gmail.com
```

Restart the dev server:

```bash
npm run dev
```

## What the SQL creates

| Object | Purpose |
|--------|---------|
| `products` | Catalogue (name, category, price, image, order) |
| `company_info` | Company header data |
| `storage.product-images` | Bucket for product photos |
| RLS policies | Public read / admin write |
| `catalogue` view | Ordered active products |

## Admin actions in the app

After login with the Supabase user:

- **Ajouter** → `INSERT` + optional Storage upload
- **Modifier** → rename, category, price, photo (`UPDATE`)
- **Supprimer** → `DELETE`

Without `.env` keys filled, the app still works offline with local JSON / localStorage.
