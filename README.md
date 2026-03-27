# 🍽️ SmartDine Pro — Complete Setup Guide

**All-in-One Restaurant Management SaaS**

---

## 📦 What's Included

| Module | Description |
|---|---|
| 🛍️ Customer App | Digital menu, cart, order placement, real-time tracking |
| 📊 Admin Dashboard | Full management: menu, orders, tables, analytics |
| 🍳 Kitchen Display | Real-time order queue for kitchen staff |
| 🖥️ POS / Billing | Point-of-sale terminal with printable receipts |
| 📦 Inventory | Stock tracking with low-stock alerts |
| 📅 Reservations | Table booking with admin approval |
| 📈 Analytics | Revenue charts, top items, order breakdown |
| 🏢 Multi-Tenant | Separate data per restaurant (SaaS ready) |

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone & Install

```bash
git clone <your-repo>
cd smartdine-pro

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Database Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE smartdine;"

# Run schema
psql -U postgres -d smartdine -f database/schema.sql
```

### 3. Environment Variables

```bash
# server/.env
cp server/.env.example server/.env
```

Edit `server/.env`:
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smartdine
DB_USER=postgres
DB_PASS=your_password
JWT_SECRET=your-super-secret-key-min-32-chars
CLIENT_URL=http://localhost:3000
```

### 4. Start Development

```bash
# Terminal 1: Start API
cd server && npm run dev

# Terminal 2: Start Client
cd client && npm start
```

Open: http://localhost:3000

---

## 🔐 Demo Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| Admin | admin@smartdine.pro | admin123 | Full dashboard |
| Kitchen | kitchen@smartdine.pro | kitchen123 | Kitchen display |
| POS | pos@smartdine.pro | pos123 | Billing terminal |

---

## 🐳 Docker Deployment

```bash
# Copy environment file
cp .env.example .env
# Edit .env with your values

# Start everything
docker compose up -d

# View logs
docker compose logs -f api
```

Access: http://localhost:3000

---

## ☁️ Production Deployment

### Option A: VPS (Ubuntu/Debian)

```bash
# Install dependencies
sudo apt update && sudo apt install -y nodejs npm postgresql nginx

# Setup PostgreSQL
sudo -u postgres createdb smartdine
sudo -u postgres psql smartdine < database/schema.sql

# Setup Nginx (reverse proxy)
sudo nano /etc/nginx/sites-available/smartdine
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        root /var/www/smartdine/client/build;
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Enable site & restart nginx
sudo ln -s /etc/nginx/sites-available/smartdine /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# Setup PM2 for Node.js process management
npm install -g pm2
cd server && pm2 start index.js --name smartdine-api
pm2 startup && pm2 save

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option B: Railway / Render / Heroku

1. Push to GitHub
2. Connect repo to Railway/Render
3. Add environment variables in dashboard
4. Deploy

---

## 💼 Selling to Restaurants (SaaS Guide)

### Pricing Tiers

| Plan | Price/mo | Restaurants | Features |
|---|---|---|---|
| Starter | $49 | 1 | Menu, Orders, Basic Analytics |
| Pro | $99 | 1 | + Inventory, Reservations, POS |
| Business | $199 | 3 | + Multi-location, Priority Support |
| Enterprise | Custom | Unlimited | White-label, Custom integrations |

### Onboarding New Restaurant

```bash
# 1. Create restaurant in DB
INSERT INTO restaurants (name, slug, plan) VALUES ('New Restaurant', 'new-restaurant', 'pro');

# 2. Create admin user
# Use the /api/auth/register endpoint (add to server for admin)

# 3. Configure branding
# Update restaurants.settings with logo, colors, name
```

### White-Label Customization
- Change logo: Update `restaurantInfo.logo` in AppContext
- Custom domain: Point DNS to your server, update nginx
- Custom colors: Update CSS variables in the app
- Remove SmartDine branding: Update footer text

---

## 🔌 API Reference

### Authentication
```
POST /api/auth/login
Body: { email, password }
Returns: { token, user }
```

All protected routes require:
```
Authorization: Bearer <token>
```

### Menu
```
GET    /api/menu               - List menu items
POST   /api/menu               - Add item (admin)
PUT    /api/menu/:id           - Update item (admin)
DELETE /api/menu/:id           - Remove item (admin)
```

### Orders
```
GET    /api/orders             - List orders
POST   /api/orders             - Place order
PUT    /api/orders/:id/status  - Update status
```

### Tables, Inventory, Reservations
```
GET/PUT /api/tables/:id
GET/PUT /api/inventory/:id
GET/POST/PUT/DELETE /api/reservations
```

### Analytics
```
GET /api/analytics/summary     - Revenue, top items, order types
```

---

## 📱 QR Code Menu System

Generate QR codes for each table that link to the customer ordering app:

```javascript
// Generate QR URL for table
const qrUrl = `https://your-domain.com/menu?restaurant=downtown&table=T1`;

// Use a QR library to generate the QR image
// npm install qrcode
const QRCode = require('qrcode');
await QRCode.toFile(`qr-T1.png`, qrUrl);
```

---

## 🌍 Multi-Language Support

To add a language, add translations in `/client/src/i18n/`:

```javascript
// /client/src/i18n/ar.js (Arabic)
export default {
  "Add to Cart": "أضف إلى السلة",
  "Place Order": "تأكيد الطلب",
  // ...
}
```

---

## 🔧 Tech Stack

- **Frontend**: React 18, Context API, CSS-in-JS
- **Backend**: Node.js 18, Express 4, JWT
- **Database**: PostgreSQL 16 (multi-tenant with restaurant_id)
- **Security**: Helmet, CORS, Rate limiting, bcrypt, input validation
- **DevOps**: Docker, Docker Compose, Nginx, PM2

---

## 📞 Support

- Documentation: https://docs.smartdine.pro
- Email: support@smartdine.pro
- License: Commercial — each purchase includes 1 production license

---

*SmartDine Pro v1.0 — Built with ❤️ for restaurant businesses worldwide*
