# Supabase Setup for SariSmart

1) Create a new project

- Open https://app.supabase.com and create a new project. Use the project database password you keep safe.

2) Run the schema

- In your Supabase project, open "SQL Editor" → create a new query, paste the contents of `supabase/schema.sql`, and run it.

3) Obtain API keys

- Go to Project Settings → API. Copy the `URL` and the `anon` public key.
- For server-side operations that require full privileges (e.g., background jobs), copy the `service_role` key (keep it secret).

4) Configure environment variables locally and in your deployment

- Create a local `.env` from `.env.example` (do NOT commit `.env`):

  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  SUPABASE_KEY=your-service-role-key

- In deployments (Vercel, Netlify, Expo, etc.) set the same variables. Use the `NEXT_PUBLIC_` prefix for values that must be exposed to the client.

5) Row Level Security & Policies (recommended)

- By default Supabase enables Row Level Security (RLS) on new tables. Decide which tables require public/selectable access (e.g., `products`) and create policies in the Dashboard → Auth → Policies. Example policy to allow authenticated users to insert into `orders` and `order_items` should be created.

6) Seed data

- The `supabase/schema.sql` contains commented `INSERT` statements you can run in the SQL editor to seed example categories and products.

7) Using the client in the app

- We added `src/lib/supabase.ts`. It reads env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client usage, and `SUPABASE_KEY` for server usage.

Example usage:

```ts
import { supabase } from './src/lib/supabase'

const { data, error } = await supabase.from('products').select('*')
```

8) Migration & advanced setup

- For production schema migrations, consider using `supabase` CLI or GitHub Actions + `sqitch`/ `pg-migrate` to apply SQL migrations from CI.
