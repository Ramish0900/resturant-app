/**
 * ============================================================
 * SmartDine Pro — All-in-One Restaurant Management System
 * Complete Single-File React Application
 * Modules: Customer App, Admin Dashboard, Kitchen Display,
 *          POS/Billing, Inventory, Reservations, Analytics
 * ============================================================
 */

import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_MENU = [
  { id: 1, name: "Classic Burger", category: "food", price: 12.99, description: "Juicy beef patty with fresh lettuce, tomato & our signature sauce", image: "🍔", available: true, ingredients: ["beef", "lettuce", "tomato", "bun"] },
  { id: 2, name: "Margherita Pizza", category: "food", price: 14.99, description: "Hand-tossed dough, San Marzano tomatoes, fresh mozzarella", image: "🍕", available: true, ingredients: ["dough", "tomato-sauce", "mozzarella"] },
  { id: 3, name: "Grilled Salmon", category: "food", price: 22.99, description: "Atlantic salmon with herb butter & seasonal vegetables", image: "🐟", available: true, ingredients: ["salmon", "butter", "herbs"] },
  { id: 4, name: "Caesar Salad", category: "food", price: 10.99, description: "Romaine, parmesan, croutons, house Caesar dressing", image: "🥗", available: true, ingredients: ["romaine", "parmesan", "croutons"] },
  { id: 5, name: "BBQ Ribs", category: "food", price: 28.99, description: "Slow-cooked pork ribs with house BBQ sauce & coleslaw", image: "🍖", available: true, ingredients: ["pork-ribs", "bbq-sauce", "coleslaw"] },
  { id: 6, name: "Pasta Carbonara", category: "food", price: 16.99, description: "Spaghetti, pancetta, eggs, pecorino romano", image: "🍝", available: true, ingredients: ["spaghetti", "pancetta", "eggs"] },
  { id: 7, name: "Chicken Wings", category: "food", price: 13.99, description: "Crispy wings with choice of buffalo, BBQ, or honey garlic", image: "🍗", available: true, ingredients: ["chicken", "sauce", "celery"] },
  { id: 8, name: "Mushroom Risotto", category: "food", price: 18.99, description: "Arborio rice, mixed mushrooms, truffle oil, parmesan", image: "🫕", available: false, ingredients: ["arborio", "mushrooms", "parmesan"] },
  { id: 9, name: "Craft Beer", category: "drinks", price: 6.99, description: "Rotating selection of local craft beers", image: "🍺", available: true, ingredients: ["beer"] },
  { id: 10, name: "House Wine", category: "drinks", price: 8.99, description: "Red or white selection from our curated wine list", image: "🍷", available: true, ingredients: ["wine"] },
  { id: 11, name: "Fresh Lemonade", category: "drinks", price: 4.99, description: "Freshly squeezed with mint and a hint of ginger", image: "🍋", available: true, ingredients: ["lemon", "sugar", "mint"] },
  { id: 12, name: "Espresso Martini", category: "drinks", price: 11.99, description: "Vodka, fresh espresso, coffee liqueur, vanilla syrup", image: "☕", available: true, ingredients: ["vodka", "espresso", "kahlua"] },
  { id: 13, name: "Mocktail Sunrise", category: "drinks", price: 5.99, description: "Orange juice, grenadine, sparkling water, fresh orange", image: "🧃", available: true, ingredients: ["orange-juice", "grenadine"] },
  { id: 14, name: "Chocolate Lava Cake", category: "desserts", price: 9.99, description: "Warm chocolate cake, molten center, vanilla ice cream", image: "🎂", available: true, ingredients: ["chocolate", "eggs", "flour", "butter"] },
  { id: 15, name: "Crème Brûlée", category: "desserts", price: 8.99, description: "Classic French custard with caramelized sugar crust", image: "🍮", available: true, ingredients: ["cream", "eggs", "sugar", "vanilla"] },
  { id: 16, name: "Tiramisu", category: "desserts", price: 7.99, description: "Ladyfingers, mascarpone, espresso, cocoa powder", image: "🍰", available: true, ingredients: ["mascarpone", "coffee", "ladyfingers"] },
  { id: 17, name: "Cheesecake", category: "desserts", price: 7.99, description: "New York style with seasonal berry compote", image: "🍰", available: true, ingredients: ["cream-cheese", "graham-cracker", "berries"] },
];

const SEED_TABLES = [
  { id: 1, number: "T1", seats: 2, status: "available" },
  { id: 2, number: "T2", seats: 4, status: "occupied" },
  { id: 3, number: "T3", seats: 4, status: "reserved" },
  { id: 4, number: "T4", seats: 6, status: "available" },
  { id: 5, number: "T5", seats: 2, status: "available" },
  { id: 6, number: "T6", seats: 8, status: "occupied" },
  { id: 7, number: "T7", seats: 4, status: "available" },
  { id: 8, number: "T8", seats: 6, status: "cleaning" },
];

const SEED_INVENTORY = [
  { id: 1, name: "Beef Patties", unit: "kg", quantity: 15, minStock: 5, cost: 12 },
  { id: 2, name: "Pizza Dough", unit: "units", quantity: 30, minStock: 10, cost: 0.5 },
  { id: 3, name: "Salmon Fillet", unit: "kg", quantity: 8, minStock: 3, cost: 18 },
  { id: 4, name: "Mozzarella", unit: "kg", quantity: 12, minStock: 4, cost: 9 },
  { id: 5, name: "Chicken Wings", unit: "kg", quantity: 4, minStock: 5, cost: 7 },
  { id: 6, name: "Pasta", unit: "kg", quantity: 20, minStock: 5, cost: 2 },
  { id: 7, name: "Tomatoes", unit: "kg", quantity: 25, minStock: 8, cost: 3 },
  { id: 8, name: "Lettuce", unit: "heads", quantity: 18, minStock: 6, cost: 1.5 },
];

const SEED_ORDERS = [
  { id: "ORD-001", table: "T2", type: "dine-in", items: [{...SEED_MENU[0], qty: 2}, {...SEED_MENU[8], qty: 2}], status: "cooking", time: new Date(Date.now()-12*60000), total: 39.96, customer: "Walk-in" },
  { id: "ORD-002", table: "T6", type: "dine-in", items: [{...SEED_MENU[1], qty: 1}, {...SEED_MENU[13], qty: 2}], status: "ready", time: new Date(Date.now()-25*60000), total: 34.97, customer: "Walk-in" },
  { id: "ORD-003", table: null, type: "delivery", items: [{...SEED_MENU[4], qty: 1}, {...SEED_MENU[15], qty: 1}], status: "pending", time: new Date(Date.now()-5*60000), total: 36.98, customer: "Ahmad Khan" },
  { id: "ORD-004", table: null, type: "takeaway", items: [{...SEED_MENU[6], qty: 2}, {...SEED_MENU[12], qty: 1}], status: "completed", time: new Date(Date.now()-60*60000), total: 33.97, customer: "Sara Ali" },
];

const SEED_RESERVATIONS = [
  { id: 1, name: "John Smith", phone: "+1-555-0100", date: "2024-12-20", time: "19:00", guests: 4, table: "T4", status: "confirmed", note: "Anniversary dinner" },
  { id: 2, name: "Maria Garcia", phone: "+1-555-0201", date: "2024-12-20", time: "20:00", guests: 2, table: "T1", status: "pending", note: "" },
  { id: 3, name: "Raza Ahmed", phone: "+92-300-1234567", date: "2024-12-21", time: "13:00", guests: 6, table: "T6", status: "confirmed", note: "Business lunch" },
];

const SEED_STAFF = [
  { id: 1, name: "Admin User", role: "admin", email: "admin@smartdine.pro", password: "admin123", restaurant: "SmartDine Downtown" },
  { id: 2, name: "Kitchen Chef", role: "kitchen", email: "kitchen@smartdine.pro", password: "kitchen123", restaurant: "SmartDine Downtown" },
  { id: 3, name: "POS Cashier", role: "pos", email: "pos@smartdine.pro", password: "pos123", restaurant: "SmartDine Downtown" },
];

// ─── APP CONTEXT ──────────────────────────────────────────────────────────────
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState("customer");
  const [menu, setMenu] = useState(SEED_MENU);
  const [orders, setOrders] = useState(SEED_ORDERS);
  const [tables, setTables] = useState(SEED_TABLES);
  const [inventory, setInventory] = useState(SEED_INVENTORY);
  const [reservations, setReservations] = useState(SEED_RESERVATIONS);
  const [cart, setCart] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [taxRate] = useState(0.08);
  const [restaurantInfo] = useState({ name: "SmartDine Pro", logo: "🍽️", currency: "$", address: "123 Main Street, New York, NY" });

  const addNotification = useCallback((msg, type = "info") => {
    const id = Date.now();
    setNotifications(n => [...n, { id, msg, type }]);
    setTimeout(() => setNotifications(n => n.filter(x => x.id !== id)), 4000);
  }, []);

  const login = useCallback((email, password) => {
    const user = SEED_STAFF.find(s => s.email === email && s.password === password);
    if (user) {
      setCurrentUser(user);
      setCurrentView(user.role === "kitchen" ? "kitchen" : user.role === "pos" ? "pos" : "admin");
      addNotification(`Welcome back, ${user.name}!`, "success");
      return true;
    }
    return false;
  }, [addNotification]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setCurrentView("customer");
    setCart([]);
    addNotification("Logged out successfully", "info");
  }, [addNotification]);

  const addToCart = useCallback((item) => {
    setCart(c => {
      const existing = c.find(x => x.id === item.id);
      if (existing) return c.map(x => x.id === item.id ? {...x, qty: x.qty + 1} : x);
      return [...c, {...item, qty: 1}];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart(c => c.filter(x => x.id !== id));
  }, []);

  const updateCartQty = useCallback((id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCart(c => c.map(x => x.id === id ? {...x, qty} : x));
  }, [removeFromCart]);

  const placeOrder = useCallback((orderData) => {
    const newOrder = {
      id: `ORD-${String(orders.length + 1).padStart(3, "0")}`,
      items: cart,
      status: "pending",
      time: new Date(),
      total: cart.reduce((s, x) => s + x.price * x.qty, 0),
      ...orderData,
    };
    setOrders(o => [newOrder, ...o]);
    setCart([]);
    addNotification("Order placed successfully!", "success");
    return newOrder;
  }, [cart, orders.length, addNotification]);

  const updateOrderStatus = useCallback((orderId, status) => {
    setOrders(o => o.map(x => x.id === orderId ? {...x, status} : x));
    addNotification(`Order ${orderId} updated to ${status}`, "success");
  }, [addNotification]);

  const addMenuItem = useCallback((item) => {
    setMenu(m => [...m, {...item, id: Date.now()}]);
    addNotification("Menu item added!", "success");
  }, [addNotification]);

  const updateMenuItem = useCallback((id, data) => {
    setMenu(m => m.map(x => x.id === id ? {...x, ...data} : x));
    addNotification("Menu item updated!", "success");
  }, [addNotification]);

  const deleteMenuItem = useCallback((id) => {
    setMenu(m => m.filter(x => x.id !== id));
    addNotification("Menu item removed", "info");
  }, [addNotification]);

  const cartTotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const cartCount = cart.reduce((s, x) => s + x.qty, 0);

  return (
    <AppContext.Provider value={{
      currentUser, currentView, setCurrentView,
      menu, orders, tables, inventory, reservations,
      cart, cartTotal, cartCount,
      notifications, darkMode, setDarkMode,
      taxRate, restaurantInfo,
      login, logout,
      addToCart, removeFromCart, updateCartQty, placeOrder,
      updateOrderStatus, addMenuItem, updateMenuItem, deleteMenuItem,
      setMenu, setOrders, setTables, setInventory, setReservations,
      addNotification,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const Badge = ({ children, color = "gray" }) => {
  const colors = {
    green: { bg: "#d1fae5", text: "#065f46" },
    red: { bg: "#fee2e2", text: "#991b1b" },
    yellow: { bg: "#fef3c7", text: "#92400e" },
    blue: { bg: "#dbeafe", text: "#1e40af" },
    gray: { bg: "#f3f4f6", text: "#374151" },
    orange: { bg: "#fed7aa", text: "#9a3412" },
    purple: { bg: "#ede9fe", text: "#5b21b6" },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 12,
      fontSize: 11, fontWeight: 600, background: c.bg, color: c.text,
      textTransform: "uppercase", letterSpacing: "0.5px"
    }}>{children}</span>
  );
};

const statusColor = (s) => ({ pending: "yellow", cooking: "orange", ready: "blue", completed: "green", cancelled: "red" }[s] || "gray");

const Modal = ({ open, onClose, title, children, width = 520 }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: width,
        maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px rgba(0,0,0,0.3)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>}
    <input {...props} style={{
      width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10,
      fontSize: 14, color: "#1e293b", outline: "none", background: "#fff", boxSizing: "border-box",
      transition: "border-color 0.2s", ...props.style
    }}
      onFocus={e => e.target.style.borderColor = "#6366f1"}
      onBlur={e => e.target.style.borderColor = "#e5e7eb"}
    />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>}
    <select {...props} style={{
      width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10,
      fontSize: 14, color: "#1e293b", outline: "none", background: "#fff", boxSizing: "border-box",
    }}>{children}</select>
  </div>
);

const Btn = ({ children, variant = "primary", size = "md", onClick, disabled, style: extra = {} }) => {
  const variants = {
    primary: { background: "#6366f1", color: "#fff", border: "none" },
    secondary: { background: "#f8fafc", color: "#374151", border: "1px solid #e2e8f0" },
    danger: { background: "#ef4444", color: "#fff", border: "none" },
    success: { background: "#10b981", color: "#fff", border: "none" },
    ghost: { background: "transparent", color: "#6366f1", border: "1px solid #6366f1" },
  };
  const sizes = { sm: { padding: "6px 14px", fontSize: 12 }, md: { padding: "10px 20px", fontSize: 14 }, lg: { padding: "14px 28px", fontSize: 16 } };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...variants[variant], ...sizes[size],
      borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600,
      opacity: disabled ? 0.6 : 1, transition: "all 0.2s", display: "inline-flex",
      alignItems: "center", gap: 8, ...extra
    }}>{children}</button>
  );
};

const Card = ({ children, style: extra = {}, onClick }) => (
  <div onClick={onClick} style={{
    background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)", padding: 20, cursor: onClick ? "pointer" : "default",
    transition: "box-shadow 0.2s", ...extra
  }}>{children}</div>
);

const StatCard = ({ label, value, icon, color = "#6366f1", sub }) => (
  <Card>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500, marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#1e293b" }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{sub}</div>}
      </div>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{icon}</div>
    </div>
  </Card>
);

// ─── NOTIFICATION SYSTEM ──────────────────────────────────────────────────────
const NotificationSystem = () => {
  const { notifications } = useApp();
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
      {notifications.map(n => (
        <div key={n.id} style={{
          background: n.type === "success" ? "#10b981" : n.type === "error" ? "#ef4444" : "#6366f1",
          color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 500,
          boxShadow: "0 8px 25px rgba(0,0,0,0.2)", animation: "slideIn 0.3s ease",
          maxWidth: 320, display: "flex", alignItems: "center", gap: 10
        }}>
          <span>{n.type === "success" ? "✓" : n.type === "error" ? "✕" : "ℹ"}</span>
          {n.msg}
        </div>
      ))}
    </div>
  );
};

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
const LoginPage = () => {
  const { login, setCurrentView, addNotification } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true); setError("");
    await new Promise(r => setTimeout(r, 600));
    if (!login(email, password)) setError("Invalid credentials. Try admin@smartdine.pro / admin123");
    setLoading(false);
  };

  const quickLogin = (role) => {
    const creds = { admin: ["admin@smartdine.pro", "admin123"], kitchen: ["kitchen@smartdine.pro", "kitchen123"], pos: ["pos@smartdine.pro", "pos123"] };
    const [e, p] = creds[role];
    setEmail(e); setPassword(p);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "40px 36px", width: "100%", maxWidth: 420, boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🍽️</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#1e293b", margin: 0 }}>SmartDine Pro</h1>
          <p style={{ color: "#64748b", margin: "8px 0 0", fontSize: 14 }}>Restaurant Management System</p>
        </div>

        {error && <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <Input label="Email Address" type="email" placeholder="admin@smartdine.pro" value={email} onChange={e => setEmail(e.target.value)} />
        <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />

        <Btn variant="primary" size="lg" onClick={handleLogin} disabled={loading} style={{ width: "100%", justifyContent: "center", marginBottom: 20 }}>
          {loading ? "Signing in..." : "Sign In"}
        </Btn>

        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 20 }}>
          <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", marginBottom: 12 }}>Quick access (demo)</p>
          <div style={{ display: "flex", gap: 8 }}>
            {["admin", "kitchen", "pos"].map(r => (
              <button key={r} onClick={() => quickLogin(r)} style={{
                flex: 1, padding: "8px 4px", background: "#f8fafc", border: "1px solid #e2e8f0",
                borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", color: "#475569", textTransform: "capitalize"
              }}>{r}</button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={() => setCurrentView("customer")} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            → View Customer Menu
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── CUSTOMER APP ─────────────────────────────────────────────────────────────
const CustomerApp = () => {
  const { menu, cart, cartTotal, cartCount, addToCart, removeFromCart, updateCartQty, placeOrder, restaurantInfo, setCurrentView, addNotification } = useApp();
  const [activeCategory, setActiveCategory] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [orderType, setOrderType] = useState("dine-in");
  const [tableNo, setTableNo] = useState("T3");
  const [customerName, setCustomerName] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [search, setSearch] = useState("");
  const [trackingOrder, setTrackingOrder] = useState(null);
  const { orders } = useApp();

  const categories = ["all", "food", "drinks", "desserts"];
  const filtered = menu.filter(i => i.available && (activeCategory === "all" || i.category === activeCategory) && (search === "" || i.name.toLowerCase().includes(search.toLowerCase())));

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    if (orderType === "delivery" && !customerName) { addNotification("Please enter your name", "error"); return; }
    const order = placeOrder({ table: orderType === "dine-in" ? tableNo : null, type: orderType, customer: customerName || "Walk-in" });
    setOrderPlaced(order);
    setCartOpen(false);
    setTrackingOrder(order.id);
  };

  const categoryIcons = { all: "🍽️", food: "🍕", drinks: "🥤", desserts: "🍰" };

  if (orderPlaced) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 24, padding: 40, maxWidth: 420, width: "100%", textAlign: "center", boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", margin: "0 0 8px" }}>Order Placed!</h2>
          <p style={{ color: "#64748b", marginBottom: 20 }}>Your order <strong>{orderPlaced.id}</strong> has been received</p>
          <div style={{ background: "#f0f9ff", borderRadius: 12, padding: 16, marginBottom: 24, textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>Order Type</span>
              <span style={{ fontWeight: 600, fontSize: 13, textTransform: "capitalize" }}>{orderPlaced.type}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>Status</span>
              <Badge color="yellow">Pending</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>Total</span>
              <span style={{ fontWeight: 700, color: "#6366f1" }}>${orderPlaced.total.toFixed(2)}</span>
            </div>
          </div>
          <div style={{ background: "#fefce8", borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: "#92400e", margin: 0 }}>⏱️ Estimated time: <strong>20-30 minutes</strong></p>
          </div>
          <Btn variant="primary" size="lg" onClick={() => setOrderPlaced(null)} style={{ width: "100%", justifyContent: "center" }}>
            Order More
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <NotificationSystem />
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, zIndex: 100, padding: "0 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 70, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>🍽️</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#1e293b" }}>SmartDine Pro</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>Digital Menu</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={() => setCurrentView("login")} style={{ background: "none", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontSize: 13, color: "#475569" }}>Staff Login</button>
            <button onClick={() => setCartOpen(true)} style={{
              background: "#6366f1", border: "none", padding: "10px 20px", borderRadius: 12,
              cursor: "pointer", fontSize: 14, color: "#fff", fontWeight: 700,
              display: "flex", alignItems: "center", gap: 8, position: "relative"
            }}>
              🛒 Cart {cartCount > 0 && <span style={{ background: "#ef4444", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", padding: "40px 20px", textAlign: "center", color: "#fff" }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, margin: "0 0 8px" }}>Fresh & Delicious</h1>
        <p style={{ opacity: 0.8, margin: "0 0 24px", fontSize: 16 }}>Order your favorite dishes, anytime</p>
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu..." style={{
            width: "100%", padding: "14px 20px", borderRadius: 14, border: "none", fontSize: 15,
            boxShadow: "0 8px 25px rgba(0,0,0,0.2)", boxSizing: "border-box", outline: "none"
          }} />
        </div>
      </div>

      {/* Categories */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "16px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 12, overflowX: "auto" }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: "10px 20px", borderRadius: 50, border: "none", cursor: "pointer", fontWeight: 600,
              fontSize: 14, whiteSpace: "nowrap", transition: "all 0.2s",
              background: activeCategory === cat ? "#6366f1" : "#f8fafc",
              color: activeCategory === cat ? "#fff" : "#64748b",
            }}>{categoryIcons[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}</button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {filtered.map(item => (
            <div key={item.id} style={{
              background: "#fff", borderRadius: 20, overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)", transition: "transform 0.2s, box-shadow 0.2s",
              border: "1px solid #f1f5f9"
            }}>
              <div style={{ background: "linear-gradient(135deg, #f8faff, #ede9fe)", height: 160, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72 }}>
                {item.image}
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>{item.name}</h3>
                  <Badge color={item.category === "food" ? "blue" : item.category === "drinks" ? "green" : "purple"}>{item.category}</Badge>
                </div>
                <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px", lineHeight: 1.5 }}>{item.description}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: "#6366f1" }}>${item.price}</span>
                  {cart.find(c => c.id === item.id) ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button onClick={() => updateCartQty(item.id, (cart.find(c => c.id === item.id)?.qty || 1) - 1)} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 16 }}>−</button>
                      <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center" }}>{cart.find(c => c.id === item.id)?.qty}</span>
                      <button onClick={() => addToCart(item)} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontSize: 16 }}>+</button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(item)} style={{
                      background: "#6366f1", color: "#fff", border: "none", padding: "10px 20px",
                      borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 13
                    }}>Add +</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 16 }}>No items found</p>
          </div>
        )}
      </div>

      {/* Cart Modal */}
      <Modal open={cartOpen} onClose={() => setCartOpen(false)} title="Your Order" width={480}>
        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 28 }}>{item.image}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{item.name}</div>
                    <div style={{ color: "#6366f1", fontWeight: 700, fontSize: 13 }}>${(item.price * item.qty).toFixed(2)}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => updateCartQty(item.id, item.qty - 1)} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer" }}>−</button>
                    <span style={{ minWidth: 20, textAlign: "center", fontWeight: 700 }}>{item.qty}</span>
                    <button onClick={() => updateCartQty(item.id, item.qty + 1)} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer" }}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <Select label="Order Type" value={orderType} onChange={e => setOrderType(e.target.value)}>
              <option value="dine-in">Dine In</option>
              <option value="takeaway">Takeaway</option>
              <option value="delivery">Delivery</option>
            </Select>
            {orderType === "dine-in" && (
              <Select label="Table Number" value={tableNo} onChange={e => setTableNo(e.target.value)}>
                {["T1","T2","T3","T4","T5","T6","T7","T8"].map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            )}
            {(orderType === "delivery" || orderType === "takeaway") && (
              <Input label="Your Name" placeholder="Enter your name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
            )}
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#64748b", fontSize: 14 }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>${cartTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#64748b", fontSize: 14 }}>Tax (8%)</span>
                <span style={{ fontWeight: 600 }}>${(cartTotal * 0.08).toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: "#6366f1" }}>${(cartTotal * 1.08).toFixed(2)}</span>
              </div>
            </div>
            <Btn variant="primary" size="lg" onClick={handlePlaceOrder} style={{ width: "100%", justifyContent: "center" }}>
              🎯 Place Order — ${(cartTotal * 1.08).toFixed(2)}
            </Btn>
          </>
        )}
      </Modal>

      <style>{`@keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
  );
};

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { currentUser, logout, menu, orders, tables, inventory, reservations, restaurantInfo, addMenuItem, updateMenuItem, deleteMenuItem, updateOrderStatus, setTables, setInventory, setReservations, addNotification, taxRate } = useApp();
  const [activeTab, setActiveTab] = useState("overview");
  const [menuModal, setMenuModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [menuForm, setMenuForm] = useState({ name: "", category: "food", price: "", description: "", image: "🍽️", available: true });
  const [resModal, setResModal] = useState(false);
  const [invModal, setInvModal] = useState(false);
  const [editInvItem, setEditInvItem] = useState(null);

  const todayOrders = orders.filter(o => {
    const today = new Date(); const orderDate = new Date(o.time);
    return orderDate.toDateString() === today.toDateString();
  });
  const todayRevenue = todayOrders.filter(o => o.status === "completed").reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter(o => ["pending","cooking"].includes(o.status)).length;
  const lowStockItems = inventory.filter(i => i.quantity <= i.minStock);

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "orders", label: "Orders", icon: "📋" },
    { id: "menu", label: "Menu", icon: "🍕" },
    { id: "tables", label: "Tables", icon: "🪑" },
    { id: "inventory", label: "Inventory", icon: "📦" },
    { id: "reservations", label: "Reservations", icon: "📅" },
    { id: "analytics", label: "Analytics", icon: "📈" },
  ];

  const openMenuForm = (item = null) => {
    if (item) { setEditItem(item); setMenuForm({ name: item.name, category: item.category, price: item.price, description: item.description, image: item.image, available: item.available }); }
    else { setEditItem(null); setMenuForm({ name: "", category: "food", price: "", description: "", image: "🍽️", available: true }); }
    setMenuModal(true);
  };

  const saveMenuItem = () => {
    if (!menuForm.name || !menuForm.price) { addNotification("Name and price are required", "error"); return; }
    if (editItem) updateMenuItem(editItem.id, { ...menuForm, price: parseFloat(menuForm.price) });
    else addMenuItem({ ...menuForm, price: parseFloat(menuForm.price), ingredients: [] });
    setMenuModal(false);
  };

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const dayOrders = orders.filter(o => new Date(o.time).toDateString() === d.toDateString() && o.status === "completed");
    return { day: d.toLocaleDateString("en", { weekday: "short" }), revenue: dayOrders.reduce((s, o) => s + o.total, 0), count: dayOrders.length };
  });

  const maxRevenue = Math.max(...weeklyData.map(d => d.revenue), 1);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f8fafc", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <NotificationSystem />

      {/* Sidebar */}
      <div style={{ width: 240, background: "#1e293b", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #334155" }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>🍽️</div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>SmartDine Pro</div>
          <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>Admin Dashboard</div>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "11px 14px",
              background: activeTab === t.id ? "#6366f1" : "transparent",
              border: "none", borderRadius: 10, cursor: "pointer", marginBottom: 4,
              color: activeTab === t.id ? "#fff" : "#94a3b8", fontWeight: 600, fontSize: 14, textAlign: "left",
              transition: "all 0.2s"
            }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span> {t.label}
              {t.id === "orders" && pendingOrders > 0 && (
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: 10, padding: "1px 8px", fontSize: 11 }}>{pendingOrders}</span>
              )}
              {t.id === "inventory" && lowStockItems.length > 0 && (
                <span style={{ marginLeft: "auto", background: "#f59e0b", color: "#fff", borderRadius: 10, padding: "1px 8px", fontSize: 11 }}>{lowStockItems.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid #334155" }}>
          <div style={{ color: "#fff", fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{currentUser?.name}</div>
          <div style={{ color: "#64748b", fontSize: 11, marginBottom: 12, textTransform: "capitalize" }}>{currentUser?.role}</div>
          <button onClick={logout} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, width: "100%" }}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Topbar */}
        <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1e293b" }}>
            {tabs.find(t => t.id === activeTab)?.icon} {tabs.find(t => t.id === activeTab)?.label}
          </h1>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ fontSize: 13, color: "#64748b" }}>{new Date().toLocaleDateString("en", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
        </div>

        <div style={{ padding: 28 }}>
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 28 }}>
                <StatCard label="Today's Revenue" value={`$${todayRevenue.toFixed(0)}`} icon="💰" color="#6366f1" sub={`${todayOrders.length} orders today`} />
                <StatCard label="Pending Orders" value={pendingOrders} icon="⏳" color="#f59e0b" sub="Needs attention" />
                <StatCard label="Menu Items" value={menu.filter(m => m.available).length} icon="🍕" color="#10b981" sub={`${menu.length} total items`} />
                <StatCard label="Low Stock Alerts" value={lowStockItems.length} icon="⚠️" color="#ef4444" sub="Check inventory" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
                <Card>
                  <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Recent Orders</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        {["Order ID", "Type", "Items", "Total", "Status"].map(h => (
                          <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 6).map(o => (
                        <tr key={o.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px 12px", fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{o.id}</td>
                          <td style={{ padding: "12px 12px" }}><Badge color="blue">{o.type}</Badge></td>
                          <td style={{ padding: "12px 12px", fontSize: 13, color: "#64748b" }}>{o.items.length} item(s)</td>
                          <td style={{ padding: "12px 12px", fontWeight: 700, color: "#6366f1" }}>${o.total.toFixed(2)}</td>
                          <td style={{ padding: "12px 12px" }}><Badge color={statusColor(o.status)}>{o.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                <Card>
                  <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Quick Actions</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { label: "Add Menu Item", icon: "➕", tab: "menu" },
                      { label: "View Orders", icon: "📋", tab: "orders" },
                      { label: "Manage Tables", icon: "🪑", tab: "tables" },
                      { label: "Check Inventory", icon: "📦", tab: "inventory" },
                      { label: "Reservations", icon: "📅", tab: "reservations" },
                    ].map(a => (
                      <button key={a.label} onClick={() => setActiveTab(a.tab)} style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                        background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 12,
                        cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#374151", textAlign: "left"
                      }}>
                        <span style={{ fontSize: 18 }}>{a.icon}</span> {a.label}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                {["pending","cooking","ready","completed"].map(s => (
                  <div key={s} style={{ background: "#fff", padding: 16, borderRadius: 14, border: "1px solid #f1f5f9", textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#1e293b" }}>{orders.filter(o => o.status === s).length}</div>
                    <Badge color={statusColor(s)}>{s}</Badge>
                  </div>
                ))}
              </div>
              <Card style={{ padding: 0 }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", fontWeight: 700, fontSize: 16, color: "#1e293b" }}>All Orders</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        {["Order ID","Customer","Type","Table","Items","Total","Time","Status","Action"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "14px 16px", fontWeight: 700, color: "#1e293b", fontSize: 13 }}>{o.id}</td>
                          <td style={{ padding: "14px 16px", fontSize: 13 }}>{o.customer}</td>
                          <td style={{ padding: "14px 16px" }}><Badge color="blue">{o.type}</Badge></td>
                          <td style={{ padding: "14px 16px", fontSize: 13, color: "#64748b" }}>{o.table || "—"}</td>
                          <td style={{ padding: "14px 16px", fontSize: 13 }}>{o.items.map(i => `${i.name}×${i.qty}`).join(", ")}</td>
                          <td style={{ padding: "14px 16px", fontWeight: 700, color: "#6366f1" }}>${o.total.toFixed(2)}</td>
                          <td style={{ padding: "14px 16px", fontSize: 12, color: "#94a3b8" }}>{new Date(o.time).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</td>
                          <td style={{ padding: "14px 16px" }}><Badge color={statusColor(o.status)}>{o.status}</Badge></td>
                          <td style={{ padding: "14px 16px" }}>
                            <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)} style={{
                              padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12,
                              cursor: "pointer", background: "#fff", color: "#374151"
                            }}>
                              {["pending","cooking","ready","completed","cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* MENU TAB */}
          {activeTab === "menu" && (
            <div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
                <Btn variant="primary" onClick={() => openMenuForm()}>+ Add Menu Item</Btn>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                {menu.map(item => (
                  <Card key={item.id}>
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      <div style={{ fontSize: 36, width: 56, height: 56, background: "#f8faff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{item.image}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>{item.name}</div>
                          <Badge color={item.available ? "green" : "red"}>{item.available ? "Active" : "Off"}</Badge>
                        </div>
                        <div style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0" }}>{item.category}</div>
                        <div style={{ fontSize: 13, color: "#64748b", margin: "4px 0 12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.description}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 18, fontWeight: 800, color: "#6366f1" }}>${item.price}</span>
                          <div style={{ display: "flex", gap: 8 }}>
                            <Btn variant="secondary" size="sm" onClick={() => openMenuForm(item)}>Edit</Btn>
                            <Btn variant="danger" size="sm" onClick={() => deleteMenuItem(item.id)}>Del</Btn>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TABLES TAB */}
          {activeTab === "tables" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
                {tables.map(table => {
                  const colors = { available: { bg: "#d1fae5", border: "#10b981", text: "#065f46" }, occupied: { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" }, reserved: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" }, cleaning: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" } };
                  const c = colors[table.status] || colors.available;
                  return (
                    <div key={table.id} style={{ background: c.bg, border: `2px solid ${c.border}`, borderRadius: 16, padding: 20, textAlign: "center" }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>🪑</div>
                      <div style={{ fontWeight: 800, fontSize: 24, color: c.text }}>{table.number}</div>
                      <div style={{ fontSize: 12, color: c.text, opacity: 0.7, marginBottom: 10 }}>{table.seats} seats</div>
                      <Badge color={{ available: "green", occupied: "red", reserved: "yellow", cleaning: "blue" }[table.status]}>{table.status}</Badge>
                      <div style={{ marginTop: 12 }}>
                        <select value={table.status} onChange={e => {
                          setTables(t => t.map(x => x.id === table.id ? {...x, status: e.target.value} : x));
                          addNotification(`Table ${table.number} set to ${e.target.value}`, "success");
                        }} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, background: "#fff", cursor: "pointer" }}>
                          {["available","occupied","reserved","cleaning"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* INVENTORY TAB */}
          {activeTab === "inventory" && (
            <div>
              {lowStockItems.length > 0 && (
                <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 12, padding: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>⚠️</span>
                  <span style={{ color: "#92400e", fontWeight: 600 }}>{lowStockItems.length} items are running low: {lowStockItems.map(i => i.name).join(", ")}</span>
                </div>
              )}
              <Card style={{ padding: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>Stock Levels</div>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Item","Unit","In Stock","Min Stock","Status","Adjust"].map(h => (
                        <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map(item => (
                      <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "14px 20px", fontWeight: 600, color: "#1e293b" }}>{item.name}</td>
                        <td style={{ padding: "14px 20px", color: "#64748b" }}>{item.unit}</td>
                        <td style={{ padding: "14px 20px", fontWeight: 700, color: item.quantity <= item.minStock ? "#ef4444" : "#1e293b" }}>{item.quantity}</td>
                        <td style={{ padding: "14px 20px", color: "#64748b" }}>{item.minStock}</td>
                        <td style={{ padding: "14px 20px" }}>
                          <Badge color={item.quantity <= item.minStock ? "red" : item.quantity <= item.minStock * 2 ? "yellow" : "green"}>
                            {item.quantity <= item.minStock ? "Low Stock" : item.quantity <= item.minStock * 2 ? "Warning" : "Good"}
                          </Badge>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => setInventory(inv => inv.map(x => x.id === item.id ? {...x, quantity: Math.max(0, x.quantity - 1)} : x))} style={{ width: 28, height: 28, border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", background: "#f8fafc" }}>−</button>
                            <button onClick={() => setInventory(inv => inv.map(x => x.id === item.id ? {...x, quantity: x.quantity + 10} : x))} style={{ padding: "0 10px", height: 28, border: "none", background: "#6366f1", color: "#fff", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>+10</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {/* RESERVATIONS TAB */}
          {activeTab === "reservations" && (
            <div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
                <Btn variant="primary" onClick={() => setResModal(true)}>+ New Reservation</Btn>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {reservations.map(res => (
                  <Card key={res.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: "#1e293b", marginBottom: 4 }}>{res.name}</div>
                        <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#64748b" }}>
                          <span>📞 {res.phone}</span>
                          <span>📅 {res.date} at {res.time}</span>
                          <span>👥 {res.guests} guests</span>
                          <span>🪑 {res.table}</span>
                        </div>
                        {res.note && <div style={{ fontSize: 13, color: "#6366f1", marginTop: 6 }}>📝 {res.note}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Badge color={res.status === "confirmed" ? "green" : "yellow"}>{res.status}</Badge>
                        {res.status === "pending" && (
                          <Btn variant="success" size="sm" onClick={() => {
                            setReservations(r => r.map(x => x.id === res.id ? {...x, status: "confirmed"} : x));
                            addNotification("Reservation confirmed!", "success");
                          }}>Confirm</Btn>
                        )}
                        <Btn variant="danger" size="sm" onClick={() => setReservations(r => r.filter(x => x.id !== res.id))}>Cancel</Btn>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 24 }}>
                <StatCard label="Total Revenue" value={`$${orders.filter(o => o.status === "completed").reduce((s, o) => s + o.total, 0).toFixed(0)}`} icon="💰" color="#6366f1" />
                <StatCard label="Total Orders" value={orders.length} icon="📋" color="#10b981" />
                <StatCard label="Avg Order Value" value={`$${(orders.reduce((s, o) => s + o.total, 0) / (orders.length || 1)).toFixed(2)}`} icon="📊" color="#f59e0b" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
                <Card>
                  <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Weekly Revenue</h3>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-end", height: 200 }}>
                    {weeklyData.map((d, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <div style={{ fontSize: 11, color: "#6366f1", fontWeight: 700 }}>${d.revenue.toFixed(0)}</div>
                        <div style={{ width: "100%", background: "#6366f1", borderRadius: "6px 6px 0 0", height: Math.max(8, (d.revenue / maxRevenue) * 160), transition: "height 0.5s", opacity: 0.85 }}></div>
                        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{d.day}</div>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Order Types</h3>
                  {["dine-in","takeaway","delivery"].map(type => {
                    const count = orders.filter(o => o.type === type).length;
                    const pct = Math.round((count / orders.length) * 100);
                    return (
                      <div key={type} style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                          <span style={{ fontWeight: 600, color: "#374151", textTransform: "capitalize" }}>{type}</span>
                          <span style={{ color: "#6366f1", fontWeight: 700 }}>{pct}%</span>
                        </div>
                        <div style={{ background: "#f1f5f9", borderRadius: 8, height: 8, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "#6366f1", borderRadius: 8, transition: "width 0.5s" }}></div>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ marginTop: 20 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>Top Items</h4>
                    {SEED_MENU.slice(0, 4).map((item, i) => (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 20 }}>{item.image}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{item.name}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>{12 - i * 2} orders</div>
                        </div>
                        <span style={{ fontWeight: 700, color: "#6366f1", fontSize: 13 }}>${((12 - i * 2) * item.price).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Menu Item Modal */}
      <Modal open={menuModal} onClose={() => setMenuModal(false)} title={editItem ? "Edit Menu Item" : "Add Menu Item"}>
        <Input label="Item Name" placeholder="e.g. Classic Burger" value={menuForm.name} onChange={e => setMenuForm(f => ({...f, name: e.target.value}))} />
        <Select label="Category" value={menuForm.category} onChange={e => setMenuForm(f => ({...f, category: e.target.value}))}>
          <option value="food">Food</option>
          <option value="drinks">Drinks</option>
          <option value="desserts">Desserts</option>
        </Select>
        <Input label="Price ($)" type="number" step="0.01" placeholder="0.00" value={menuForm.price} onChange={e => setMenuForm(f => ({...f, price: e.target.value}))} />
        <Input label="Emoji Icon" placeholder="🍔" value={menuForm.image} onChange={e => setMenuForm(f => ({...f, image: e.target.value}))} />
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Description</label>
          <textarea value={menuForm.description} onChange={e => setMenuForm(f => ({...f, description: e.target.value}))} rows={3} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <input type="checkbox" id="available" checked={menuForm.available} onChange={e => setMenuForm(f => ({...f, available: e.target.checked}))} />
          <label htmlFor="available" style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>Available on menu</label>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="secondary" onClick={() => setMenuModal(false)} style={{ flex: 1, justifyContent: "center" }}>Cancel</Btn>
          <Btn variant="primary" onClick={saveMenuItem} style={{ flex: 1, justifyContent: "center" }}>
            {editItem ? "Save Changes" : "Add Item"}
          </Btn>
        </div>
      </Modal>

      {/* New Reservation Modal */}
      <Modal open={resModal} onClose={() => setResModal(false)} title="New Reservation">
        {(() => {
          const [form, setForm] = useState({ name: "", phone: "", date: "", time: "", guests: 2, table: "T4", note: "" });
          return (
            <>
              <Input label="Guest Name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
              <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Input label="Date" type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} />
                <Input label="Time" type="time" value={form.time} onChange={e => setForm(f => ({...f, time: e.target.value}))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Input label="Guests" type="number" min={1} max={20} value={form.guests} onChange={e => setForm(f => ({...f, guests: parseInt(e.target.value)}))} />
                <Select label="Table" value={form.table} onChange={e => setForm(f => ({...f, table: e.target.value}))}>
                  {tables.map(t => <option key={t.id} value={t.number}>{t.number} ({t.seats} seats)</option>)}
                </Select>
              </div>
              <Input label="Note (optional)" value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))} />
              <Btn variant="primary" size="lg" onClick={() => {
                setReservations(r => [...r, { ...form, id: Date.now(), status: "pending" }]);
                setResModal(false);
                addNotification("Reservation added!", "success");
              }} style={{ width: "100%", justifyContent: "center" }}>Add Reservation</Btn>
            </>
          );
        })()}
      </Modal>
    </div>
  );
};

// ─── KITCHEN DISPLAY SYSTEM ───────────────────────────────────────────────────
const KitchenDisplay = () => {
  const { orders, updateOrderStatus, logout, currentUser } = useApp();
  const [filter, setFilter] = useState("active");
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const activeOrders = orders.filter(o => filter === "active" ? ["pending","cooking"].includes(o.status) : o.status === "ready");

  const getElapsed = (orderTime) => {
    const diff = Math.floor((new Date() - new Date(orderTime)) / 60000);
    return diff;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#111827", fontFamily: "'Inter', -apple-system, sans-serif", color: "#fff" }}>
      {/* Header */}
      <div style={{ background: "#1f2937", borderBottom: "1px solid #374151", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>🍳 Kitchen Display</div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>{currentUser?.restaurant}</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#f59e0b", fontVariantNumeric: "tabular-nums" }}>
            {time.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit", second:"2-digit"})}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 0, border: "1px solid #374151", borderRadius: 10, overflow: "hidden" }}>
            {["active","ready"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "10px 20px", background: filter === f ? "#f59e0b" : "transparent",
                border: "none", color: filter === f ? "#000" : "#9ca3af", cursor: "pointer",
                fontWeight: 700, fontSize: 14, textTransform: "capitalize"
              }}>{f} ({orders.filter(o => f === "active" ? ["pending","cooking"].includes(o.status) : o.status === f).length})</button>
            ))}
          </div>
          <button onClick={logout} style={{ background: "#ef4444", border: "none", color: "#fff", padding: "10px 16px", borderRadius: 10, cursor: "pointer", fontWeight: 600 }}>Exit</button>
        </div>
      </div>

      {/* Order Cards */}
      <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, alignItems: "start" }}>
        {activeOrders.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "#6b7280" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>All caught up! No {filter} orders.</div>
          </div>
        )}
        {activeOrders.map(order => {
          const elapsed = getElapsed(order.time);
          const urgent = elapsed > 20;
          return (
            <div key={order.id} style={{
              background: urgent ? "#7f1d1d" : order.status === "cooking" ? "#1a2e1a" : "#1e293b",
              border: `2px solid ${urgent ? "#ef4444" : order.status === "cooking" ? "#10b981" : "#374151"}`,
              borderRadius: 16, padding: 20, transition: "all 0.3s"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{order.id}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <span style={{ background: "#374151", padding: "3px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#d1d5db", textTransform: "capitalize" }}>{order.type}</span>
                    {order.table && <span style={{ background: "#4b5563", padding: "3px 10px", borderRadius: 8, fontSize: 12, color: "#d1d5db" }}>🪑 {order.table}</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: urgent ? "#fca5a5" : "#f59e0b" }}>{elapsed}m</div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>elapsed</div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #374151", paddingTop: 16, marginBottom: 16 }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1f2937" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 22 }}>{item.image}</span>
                      <span style={{ color: "#f3f4f6", fontWeight: 600, fontSize: 15 }}>{item.name}</span>
                    </div>
                    <span style={{ background: "#f59e0b", color: "#000", fontWeight: 900, width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>×{item.qty}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                {order.status === "pending" && (
                  <button onClick={() => updateOrderStatus(order.id, "cooking")} style={{
                    flex: 1, background: "#f59e0b", border: "none", color: "#000",
                    padding: 14, borderRadius: 12, cursor: "pointer", fontWeight: 800, fontSize: 16
                  }}>🔥 Start Cooking</button>
                )}
                {order.status === "cooking" && (
                  <button onClick={() => updateOrderStatus(order.id, "ready")} style={{
                    flex: 1, background: "#10b981", border: "none", color: "#fff",
                    padding: 14, borderRadius: 12, cursor: "pointer", fontWeight: 800, fontSize: 16
                  }}>✅ Mark Ready</button>
                )}
                {order.status === "ready" && (
                  <button onClick={() => updateOrderStatus(order.id, "completed")} style={{
                    flex: 1, background: "#6366f1", border: "none", color: "#fff",
                    padding: 14, borderRadius: 12, cursor: "pointer", fontWeight: 800, fontSize: 16
                  }}>🎯 Complete</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── POS / BILLING SYSTEM ─────────────────────────────────────────────────────
const POSSystem = () => {
  const { menu, orders, updateOrderStatus, logout, currentUser, taxRate, restaurantInfo } = useApp();
  const [posCart, setPosCart] = useState([]);
  const [orderType, setOrderType] = useState("dine-in");
  const [tableNo, setTableNo] = useState("T1");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [receipt, setReceipt] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const printRef = useRef();

  const posCartTotal = posCart.reduce((s, x) => s + x.price * x.qty, 0);
  const tax = posCartTotal * taxRate;
  const grandTotal = posCartTotal + tax;

  const addToPos = (item) => setPosCart(c => {
    const ex = c.find(x => x.id === item.id);
    return ex ? c.map(x => x.id === item.id ? {...x, qty: x.qty + 1} : x) : [...c, {...item, qty: 1}];
  });

  const filteredMenu = menu.filter(i => i.available && (activeCategory === "all" || i.category === activeCategory));

  const generateBill = () => {
    if (posCart.length === 0) return;
    const bill = {
      id: `BILL-${Date.now()}`,
      date: new Date().toLocaleString(),
      items: posCart,
      subtotal: posCartTotal,
      tax, total: grandTotal,
      payment: paymentMethod,
      type: orderType, table: tableNo,
      cashier: currentUser?.name,
      restaurant: restaurantInfo.name
    };
    setReceipt(bill);
  };

  const printReceipt = () => window.print();

  if (receipt) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 400, width: "100%" }}>
          <div ref={printRef} style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontFamily: "monospace" }}>
            <div style={{ textAlign: "center", marginBottom: 20, borderBottom: "2px dashed #e5e7eb", paddingBottom: 16 }}>
              <div style={{ fontSize: 32 }}>🍽️</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#1e293b" }}>{receipt.restaurant}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Receipt / Invoice</div>
            </div>
            <div style={{ marginBottom: 16, fontSize: 12, color: "#64748b" }}>
              <div>Bill No: <strong>{receipt.id}</strong></div>
              <div>Date: <strong>{receipt.date}</strong></div>
              <div>Cashier: <strong>{receipt.cashier}</strong></div>
              <div>Type: <strong style={{ textTransform: "capitalize" }}>{receipt.type}</strong></div>
              {receipt.table && <div>Table: <strong>{receipt.table}</strong></div>}
            </div>
            <div style={{ borderTop: "1px dashed #e5e7eb", borderBottom: "1px dashed #e5e7eb", padding: "12px 0", marginBottom: 12 }}>
              {receipt.items.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                  <span>{item.name} × {item.qty}</span>
                  <span style={{ fontWeight: 600 }}>${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#64748b" }}>Subtotal</span>
                <span>${receipt.subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#64748b" }}>Tax ({(taxRate * 100).toFixed(0)}%)</span>
                <span>${receipt.tax.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 900, color: "#6366f1", borderTop: "2px solid #e5e7eb", paddingTop: 8 }}>
                <span>TOTAL</span>
                <span>${receipt.total.toFixed(2)}</span>
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#94a3b8" }}>
              <div>Payment: {receipt.payment.toUpperCase()}</div>
              <div style={{ marginTop: 8 }}>Thank you for dining with us! 🙏</div>
              <div>Powered by SmartDine Pro</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <Btn variant="secondary" size="lg" onClick={() => setReceipt(null)} style={{ flex: 1, justifyContent: "center" }}>← New Order</Btn>
            <Btn variant="primary" size="lg" onClick={printReceipt} style={{ flex: 1, justifyContent: "center" }}>🖨️ Print</Btn>
          </div>
        </div>
        <style>{`@media print { body > * { display: none; } body > div > div:first-child { display: block !important; } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f8fafc", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Left: Menu */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ background: "#1e293b", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>🖥️ Point of Sale</div>
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ color: "#94a3b8", fontSize: 13 }}>{currentUser?.name}</span>
            <button onClick={logout} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>Exit</button>
          </div>
        </div>
        <div style={{ padding: "12px 16px", background: "#fff", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 10 }}>
          {["all","food","drinks","desserts"].map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: "8px 16px", borderRadius: 50, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
              background: activeCategory === cat ? "#6366f1" : "#f8fafc", color: activeCategory === cat ? "#fff" : "#64748b"
            }}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</button>
          ))}
        </div>
        <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, overflowY: "auto" }}>
          {filteredMenu.map(item => (
            <button key={item.id} onClick={() => addToPos(item)} style={{
              background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14, padding: 16, cursor: "pointer",
              textAlign: "center", transition: "all 0.15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 8
            }}>
              <span style={{ fontSize: 36 }}>{item.image}</span>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", lineHeight: 1.3 }}>{item.name}</div>
              <div style={{ fontWeight: 800, color: "#6366f1", fontSize: 15 }}>${item.price}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Bill */}
      <div style={{ width: 360, background: "#fff", borderLeft: "1px solid #f1f5f9", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#1e293b", marginBottom: 12 }}>Current Order</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {["dine-in","takeaway","delivery"].map(t => (
              <button key={t} onClick={() => setOrderType(t)} style={{
                flex: 1, padding: "7px 4px", borderRadius: 8, border: "1px solid #e2e8f0", cursor: "pointer",
                fontSize: 11, fontWeight: 600, textTransform: "capitalize",
                background: orderType === t ? "#6366f1" : "#f8fafc", color: orderType === t ? "#fff" : "#64748b"
              }}>{t}</button>
            ))}
          </div>
          {orderType === "dine-in" && (
            <select value={tableNo} onChange={e => setTableNo(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13 }}>
              {["T1","T2","T3","T4","T5","T6","T7","T8"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px" }}>
          {posCart.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
              <div>Click items to add</div>
            </div>
          )}
          {posCart.map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f8fafc" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{item.name}</div>
                <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 700 }}>${(item.price * item.qty).toFixed(2)}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => setPosCart(c => c.map(x => x.id === item.id ? {...x, qty: Math.max(0, x.qty - 1)} : x).filter(x => x.qty > 0))} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 12 }}>−</button>
                <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                <button onClick={() => addToPos(item)} style={{ width: 24, height: 24, borderRadius: 6, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontSize: 12 }}>+</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: 20, borderTop: "1px solid #f1f5f9" }}>
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}><span style={{ color: "#64748b" }}>Subtotal</span><span>${posCartTotal.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}><span style={{ color: "#64748b" }}>Tax ({(taxRate * 100).toFixed(0)}%)</span><span>${tax.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800 }}><span>Total</span><span style={{ color: "#6366f1" }}>${grandTotal.toFixed(2)}</span></div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {["cash","card","online"].map(m => (
              <button key={m} onClick={() => setPaymentMethod(m)} style={{
                flex: 1, padding: "8px 4px", borderRadius: 8, border: "1px solid #e2e8f0", cursor: "pointer",
                fontSize: 12, fontWeight: 600, textTransform: "capitalize",
                background: paymentMethod === m ? "#10b981" : "#f8fafc", color: paymentMethod === m ? "#fff" : "#64748b"
              }}>{m === "cash" ? "💵" : m === "card" ? "💳" : "📱"} {m}</button>
            ))}
          </div>
          <Btn variant="primary" size="lg" onClick={generateBill} disabled={posCart.length === 0} style={{ width: "100%", justifyContent: "center" }}>
            🧾 Generate Bill
          </Btn>
          <Btn variant="secondary" size="sm" onClick={() => setPosCart([])} style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
            Clear Order
          </Btn>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function AppRouter() {
  const { currentUser, currentView, setCurrentView } = useApp();

  if (!currentUser && currentView !== "customer") {
    return <LoginPage />;
  }

  const views = { customer: CustomerApp, admin: AdminDashboard, kitchen: KitchenDisplay, pos: POSSystem, login: LoginPage };
  const Component = views[currentView] || CustomerApp;
  return <Component />;
}

export default function SmartDinePro() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
