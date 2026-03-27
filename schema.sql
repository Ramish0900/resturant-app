-- SmartDine Pro — PostgreSQL Database Schema
-- Multi-tenant, production-ready
-- Run: psql -U postgres -d smartdine -f schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- RESTAURANTS (Multi-Tenant Core)
CREATE TABLE restaurants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(200) NOT NULL,
  slug          VARCHAR(100) UNIQUE NOT NULL,
  logo          TEXT,
  address       TEXT,
  phone         VARCHAR(30),
  email         VARCHAR(200),
  currency      VARCHAR(10) DEFAULT '$',
  timezone      VARCHAR(50) DEFAULT 'UTC',
  tax_rate      DECIMAL(5,4) DEFAULT 0.08,
  plan          VARCHAR(30) DEFAULT 'starter',
  active        BOOLEAN DEFAULT true,
  settings      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- STAFF
CREATE TABLE staff (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  email           VARCHAR(200) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  role            VARCHAR(30) NOT NULL CHECK (role IN ('admin','kitchen','pos','waiter','super_admin')),
  phone           VARCHAR(30),
  active          BOOLEAN DEFAULT true,
  last_login      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_restaurant ON staff(restaurant_id);

-- MENU ITEMS
CREATE TABLE menu_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  category        VARCHAR(50) NOT NULL CHECK (category IN ('food','drinks','desserts','specials')),
  price           DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  description     TEXT,
  image           VARCHAR(10) DEFAULT '🍽️',
  image_url       TEXT,
  available       BOOLEAN DEFAULT true,
  featured        BOOLEAN DEFAULT false,
  ingredients     JSONB DEFAULT '[]',
  allergens       JSONB DEFAULT '[]',
  nutrition       JSONB DEFAULT '{}',
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_menu_category ON menu_items(category);

-- TABLES
CREATE TABLE tables (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  number          VARCHAR(10) NOT NULL,
  seats           INT NOT NULL DEFAULT 4,
  status          VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available','occupied','reserved','cleaning')),
  qr_code         TEXT,
  floor           VARCHAR(50) DEFAULT 'main',
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS
CREATE TABLE orders (
  id              VARCHAR(30) PRIMARY KEY,
  restaurant_id   UUID REFERENCES restaurants(id),
  type            VARCHAR(20) NOT NULL CHECK (type IN ('dine-in','takeaway','delivery')),
  table_number    VARCHAR(10),
  customer_name   VARCHAR(200),
  customer_phone  VARCHAR(30),
  payment_method  VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash','card','online')),
  payment_status  VARCHAR(20) DEFAULT 'pending',
  subtotal        DECIMAL(10,2) NOT NULL,
  tax             DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount        DECIMAL(10,2) DEFAULT 0,
  total           DECIMAL(10,2) NOT NULL,
  status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','cooking','ready','completed','cancelled')),
  notes           TEXT,
  created_by      UUID REFERENCES staff(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- ORDER ITEMS
CREATE TABLE order_items (
  id              SERIAL PRIMARY KEY,
  order_id        VARCHAR(30) REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id    UUID REFERENCES menu_items(id),
  quantity        INT NOT NULL CHECK (quantity > 0),
  unit_price      DECIMAL(10,2) NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- INVENTORY
CREATE TABLE inventory (
  id              SERIAL PRIMARY KEY,
  restaurant_id   UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  unit            VARCHAR(50) NOT NULL,
  quantity        DECIMAL(12,3) NOT NULL DEFAULT 0,
  min_stock       DECIMAL(12,3) NOT NULL DEFAULT 0,
  cost_per_unit   DECIMAL(10,2) DEFAULT 0,
  supplier        VARCHAR(200),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- MENU INGREDIENTS
CREATE TABLE menu_ingredients (
  id              SERIAL PRIMARY KEY,
  menu_item_id    UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  inventory_id    INT REFERENCES inventory(id),
  quantity_needed DECIMAL(12,3) NOT NULL
);

-- RESERVATIONS
CREATE TABLE reservations (
  id              SERIAL PRIMARY KEY,
  restaurant_id   UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  phone           VARCHAR(30),
  email           VARCHAR(200),
  date            DATE NOT NULL,
  time            TIME NOT NULL,
  guests          INT NOT NULL,
  table_id        UUID REFERENCES tables(id),
  status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  note            TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- LOYALTY
CREATE TABLE loyalty_customers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID REFERENCES restaurants(id),
  name            VARCHAR(200),
  email           VARCHAR(200),
  phone           VARCHAR(30) UNIQUE,
  points          INT DEFAULT 0,
  total_spent     DECIMAL(12,2) DEFAULT 0,
  visits          INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- VIEWS
CREATE OR REPLACE VIEW daily_revenue AS
SELECT restaurant_id, DATE(created_at) as date, COUNT(*) as order_count, SUM(total) as revenue
FROM orders WHERE status = 'completed' GROUP BY restaurant_id, DATE(created_at);

CREATE OR REPLACE VIEW low_stock_items AS
SELECT i.*, r.name as restaurant_name
FROM inventory i JOIN restaurants r ON i.restaurant_id = r.id
WHERE i.quantity <= i.min_stock;
