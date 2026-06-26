-- Supabase / Postgres schema for SariSmart
-- Enables required extensions
create extension if not exists "pgcrypto";

-- Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  currency text not null default 'PHP',
  image_url text,
  category_id uuid references categories(id) on delete set null,
  available boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_products_category on products(category_id);

-- Customers
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text unique,
  phone text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  total numeric(12,2) default 0,
  status text default 'pending',
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_orders_customer on orders(customer_id);

-- Order items
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  quantity int not null default 1,
  unit_price numeric(10,2) not null default 0,
  created_at timestamptz default now()
);

create index if not exists idx_order_items_order on order_items(order_id);

-- Cart items (guest or customer carts)
create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  quantity int not null default 1,
  added_at timestamptz default now()
);

create index if not exists idx_cart_customer on cart_items(customer_id);

-- Optional seed data (uncomment to run)
-- insert into categories (name, slug) values ('Drinks','drinks'), ('Snacks','snacks'), ('Meals','meals');
-- insert into products (name, description, price, currency, category_id) values ('Sample Product','Example',99.00,'PHP',(select id from categories where slug='drinks' limit 1));
