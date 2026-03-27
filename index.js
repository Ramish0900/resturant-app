/**
 * SmartDine Pro — Backend API Server
 * Node.js + Express + PostgreSQL + JWT Auth
 * 
 * Endpoints:
 *   POST   /api/auth/login
 *   GET    /api/menu
 *   POST   /api/menu         (admin)
 *   PUT    /api/menu/:id     (admin)
 *   DELETE /api/menu/:id     (admin)
 *   GET    /api/orders
 *   POST   /api/orders
 *   PUT    /api/orders/:id/status
 *   GET    /api/tables
 *   PUT    /api/tables/:id
 *   GET    /api/inventory
 *   PUT    /api/inventory/:id
 *   GET    /api/reservations
 *   POST   /api/reservations
 *   PUT    /api/reservations/:id
 *   DELETE /api/reservations/:id
 *   GET    /api/analytics/summary
 *   GET    /api/restaurants   (super-admin, multi-tenant)
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "smartdine-pro-secret-change-in-production";

// ─── DATABASE POOL ───────────────────────────────────────────────────────────
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "smartdine",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "password",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => console.error("DB pool error:", err));

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: "Too many requests" });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: "Too many login attempts" });
app.use("/api/", limiter);
app.use("/api/auth/", authLimiter);

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────────────────────
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ error: "Insufficient permissions" });
  }
  next();
};

// Multi-tenant: ensure data is scoped to the user's restaurant
const tenantFilter = (req) => ({
  restaurant_id: req.user.restaurant_id,
});

// ─── VALIDATION HELPERS ───────────────────────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

// ── AUTH ──────────────────────────────────────────────────────────────────────
app.post("/api/auth/login",
  [body("email").isEmail(), body("password").notEmpty()],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const { rows } = await pool.query(
        "SELECT * FROM staff WHERE email = $1 AND active = true",
        [email]
      );
      const user = rows[0];
      if (!user || !await bcrypt.compare(password, user.password_hash)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, restaurant_id: user.restaurant_id, name: user.name },
        JWT_SECRET,
        { expiresIn: "12h" }
      );
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, restaurant_id: user.restaurant_id } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

app.post("/api/auth/refresh", authenticate, async (req, res) => {
  const token = jwt.sign(
    { id: req.user.id, email: req.user.email, role: req.user.role, restaurant_id: req.user.restaurant_id, name: req.user.name },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
  res.json({ token });
});

// ── MENU ──────────────────────────────────────────────────────────────────────
app.get("/api/menu", authenticate, async (req, res) => {
  try {
    const { category, available } = req.query;
    let query = "SELECT * FROM menu_items WHERE restaurant_id = $1";
    const params = [req.user.restaurant_id];
    if (category) { query += ` AND category = $${params.length + 1}`; params.push(category); }
    if (available !== undefined) { query += ` AND available = $${params.length + 1}`; params.push(available === "true"); }
    query += " ORDER BY category, name";
    const { rows } = await pool.query(query, params);
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

app.post("/api/menu",
  authenticate, requireRole("admin"),
  [body("name").notEmpty(), body("price").isFloat({ min: 0 }), body("category").isIn(["food","drinks","desserts"])],
  validate,
  async (req, res) => {
    try {
      const { name, category, price, description, image, available = true, ingredients = [] } = req.body;
      const { rows } = await pool.query(
        `INSERT INTO menu_items (restaurant_id, name, category, price, description, image, available, ingredients)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [req.user.restaurant_id, name, category, price, description, image, available, JSON.stringify(ingredients)]
      );
      res.status(201).json({ item: rows[0] });
    } catch (err) {
      res.status(500).json({ error: "Failed to create menu item" });
    }
  }
);

app.put("/api/menu/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { name, category, price, description, image, available, ingredients } = req.body;
    const { rows } = await pool.query(
      `UPDATE menu_items SET name=$1, category=$2, price=$3, description=$4, image=$5, available=$6, ingredients=$7, updated_at=NOW()
       WHERE id=$8 AND restaurant_id=$9 RETURNING *`,
      [name, category, price, description, image, available, JSON.stringify(ingredients), req.params.id, req.user.restaurant_id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Item not found" });
    res.json({ item: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to update menu item" });
  }
});

app.delete("/api/menu/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM menu_items WHERE id=$1 AND restaurant_id=$2",
      [req.params.id, req.user.restaurant_id]
    );
    if (!rowCount) return res.status(404).json({ error: "Item not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

// ── ORDERS ────────────────────────────────────────────────────────────────────
app.get("/api/orders", authenticate, async (req, res) => {
  try {
    const { status, date_from, date_to, type } = req.query;
    let query = `SELECT o.*, json_agg(json_build_object('id',oi.menu_item_id,'name',m.name,'price',oi.unit_price,'qty',oi.quantity,'image',m.image)) as items
                 FROM orders o
                 LEFT JOIN order_items oi ON o.id = oi.order_id
                 LEFT JOIN menu_items m ON oi.menu_item_id = m.id
                 WHERE o.restaurant_id = $1`;
    const params = [req.user.restaurant_id];
    if (status) { query += ` AND o.status = $${params.length + 1}`; params.push(status); }
    if (type) { query += ` AND o.type = $${params.length + 1}`; params.push(type); }
    if (date_from) { query += ` AND o.created_at >= $${params.length + 1}`; params.push(date_from); }
    if (date_to) { query += ` AND o.created_at <= $${params.length + 1}`; params.push(date_to); }
    query += " GROUP BY o.id ORDER BY o.created_at DESC LIMIT 200";
    const { rows } = await pool.query(query, params);
    res.json({ orders: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.post("/api/orders",
  authenticate,
  [body("items").isArray({ min: 1 }), body("type").isIn(["dine-in","takeaway","delivery"])],
  validate,
  async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { items, type, table_number, customer_name, payment_method = "cash" } = req.body;

      // Calculate total from DB prices (security: never trust client prices)
      const ids = items.map(i => i.id);
      const { rows: menuItems } = await client.query(
        "SELECT id, price, name FROM menu_items WHERE id = ANY($1) AND restaurant_id=$2 AND available=true",
        [ids, req.user.restaurant_id]
      );
      if (menuItems.length !== items.length) throw new Error("Some items are unavailable");

      const total = items.reduce((s, item) => {
        const mi = menuItems.find(m => m.id === item.id);
        return s + (mi.price * item.qty);
      }, 0);

      const orderId = `ORD-${Date.now()}`;
      const { rows: orderRows } = await client.query(
        `INSERT INTO orders (id, restaurant_id, type, table_number, customer_name, payment_method, subtotal, tax, total, status, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending',$10) RETURNING *`,
        [orderId, req.user.restaurant_id, type, table_number, customer_name, payment_method, total, total * 0.08, total * 1.08, req.user.id]
      );

      for (const item of items) {
        const mi = menuItems.find(m => m.id === item.id);
        await client.query(
          "INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES ($1,$2,$3,$4)",
          [orderId, item.id, item.qty, mi.price]
        );
      }

      // Reduce inventory based on ingredients
      for (const item of items) {
        const mi = menuItems.find(m => m.id === item.id);
        const { rows: ingRows } = await client.query(
          "SELECT * FROM menu_ingredients WHERE menu_item_id=$1", [mi.id]
        );
        for (const ing of ingRows) {
          await client.query(
            "UPDATE inventory SET quantity = GREATEST(0, quantity - $1) WHERE id=$2 AND restaurant_id=$3",
            [ing.quantity_needed * item.qty, ing.inventory_id, req.user.restaurant_id]
          );
        }
      }

      await client.query("COMMIT");
      res.status(201).json({ order: orderRows[0] });
    } catch (err) {
      await client.query("ROLLBACK");
      res.status(500).json({ error: err.message || "Failed to place order" });
    } finally {
      client.release();
    }
  }
);

app.put("/api/orders/:id/status", authenticate, requireRole("admin","kitchen","pos"), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending","cooking","ready","completed","cancelled"];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });
    const { rows } = await pool.query(
      "UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 AND restaurant_id=$3 RETURNING *",
      [status, req.params.id, req.user.restaurant_id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Order not found" });
    res.json({ order: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to update order" });
  }
});

// ── TABLES ────────────────────────────────────────────────────────────────────
app.get("/api/tables", authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM tables WHERE restaurant_id=$1 ORDER BY number", [req.user.restaurant_id]);
    res.json({ tables: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tables" });
  }
});

app.put("/api/tables/:id", authenticate, requireRole("admin","pos"), async (req, res) => {
  try {
    const { status } = req.body;
    const { rows } = await pool.query(
      "UPDATE tables SET status=$1, updated_at=NOW() WHERE id=$2 AND restaurant_id=$3 RETURNING *",
      [status, req.params.id, req.user.restaurant_id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Table not found" });
    res.json({ table: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to update table" });
  }
});

// ── INVENTORY ─────────────────────────────────────────────────────────────────
app.get("/api/inventory", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM inventory WHERE restaurant_id=$1 ORDER BY name",
      [req.user.restaurant_id]
    );
    res.json({ inventory: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

app.put("/api/inventory/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { quantity, min_stock } = req.body;
    const { rows } = await pool.query(
      "UPDATE inventory SET quantity=$1, min_stock=$2, updated_at=NOW() WHERE id=$3 AND restaurant_id=$4 RETURNING *",
      [quantity, min_stock, req.params.id, req.user.restaurant_id]
    );
    res.json({ item: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to update inventory" });
  }
});

// ── RESERVATIONS ──────────────────────────────────────────────────────────────
app.get("/api/reservations", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { date } = req.query;
    let query = "SELECT * FROM reservations WHERE restaurant_id=$1";
    const params = [req.user.restaurant_id];
    if (date) { query += ` AND date=$${params.length + 1}`; params.push(date); }
    query += " ORDER BY date, time";
    const { rows } = await pool.query(query, params);
    res.json({ reservations: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
});

app.post("/api/reservations",
  [body("name").notEmpty(), body("date").isISO8601(), body("time").notEmpty(), body("guests").isInt({ min: 1 })],
  validate,
  async (req, res) => {
    try {
      const { name, phone, date, time, guests, table_id, note } = req.body;
      const restaurant_id = req.user?.restaurant_id || req.body.restaurant_id;
      const { rows } = await pool.query(
        `INSERT INTO reservations (restaurant_id, name, phone, date, time, guests, table_id, note, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending') RETURNING *`,
        [restaurant_id, name, phone, date, time, guests, table_id, note]
      );
      res.status(201).json({ reservation: rows[0] });
    } catch (err) {
      res.status(500).json({ error: "Failed to create reservation" });
    }
  }
);

app.put("/api/reservations/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    const { rows } = await pool.query(
      "UPDATE reservations SET status=$1, updated_at=NOW() WHERE id=$2 AND restaurant_id=$3 RETURNING *",
      [status, req.params.id, req.user.restaurant_id]
    );
    res.json({ reservation: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to update reservation" });
  }
});

app.delete("/api/reservations/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    await pool.query("DELETE FROM reservations WHERE id=$1 AND restaurant_id=$2", [req.params.id, req.user.restaurant_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete reservation" });
  }
});

// ── ANALYTICS ─────────────────────────────────────────────────────────────────
app.get("/api/analytics/summary", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const rid = req.user.restaurant_id;
    const today = new Date().toISOString().split("T")[0];

    const [todayRev, weekRev, topItems, ordersByType] = await Promise.all([
      pool.query("SELECT COALESCE(SUM(total),0) as revenue, COUNT(*) as count FROM orders WHERE restaurant_id=$1 AND DATE(created_at)=$2 AND status='completed'", [rid, today]),
      pool.query("SELECT DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as count FROM orders WHERE restaurant_id=$1 AND created_at >= NOW()-INTERVAL '7 days' AND status='completed' GROUP BY DATE(created_at) ORDER BY date", [rid]),
      pool.query("SELECT m.name, m.image, SUM(oi.quantity) as total_sold, SUM(oi.quantity*oi.unit_price) as revenue FROM order_items oi JOIN menu_items m ON oi.menu_item_id=m.id JOIN orders o ON oi.order_id=o.id WHERE o.restaurant_id=$1 AND o.status='completed' GROUP BY m.id ORDER BY total_sold DESC LIMIT 5", [rid]),
      pool.query("SELECT type, COUNT(*) as count FROM orders WHERE restaurant_id=$1 GROUP BY type", [rid]),
    ]);

    res.json({
      today: todayRev.rows[0],
      weekly: weekRev.rows,
      topItems: topItems.rows,
      ordersByType: ordersByType.rows,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// ── MULTI-RESTAURANT (Super Admin) ────────────────────────────────────────────
app.get("/api/restaurants", authenticate, requireRole("super_admin"), async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, name, slug, plan, active, created_at FROM restaurants ORDER BY name");
    res.json({ restaurants: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
});

app.post("/api/restaurants", authenticate, requireRole("super_admin"),
  [body("name").notEmpty(), body("slug").notEmpty()],
  validate,
  async (req, res) => {
    try {
      const { name, slug, plan = "starter" } = req.body;
      const { rows } = await pool.query(
        "INSERT INTO restaurants (name, slug, plan) VALUES ($1,$2,$3) RETURNING *",
        [name, slug, plan]
      );
      res.status(201).json({ restaurant: rows[0] });
    } catch (err) {
      res.status(500).json({ error: "Failed to create restaurant" });
    }
  }
);

// ── ERROR HANDLER ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// ─── START SERVER ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   SmartDine Pro API Server           ║
  ║   Running on port ${PORT}               ║
  ║   Environment: ${process.env.NODE_ENV || "development"}           ║
  ╚══════════════════════════════════════╝
  `);
});

module.exports = app;
