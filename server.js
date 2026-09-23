const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 5501);
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const FORMSPREE_ENDPOINT = process.env.FORMSPREE_ENDPOINT || "https://formspree.io/f/mbglyqqy";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const DATA_DIR = path.join(__dirname, "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const sessions = new Map();
const PRODUCT_CATEGORIES = new Set(["milktea", "silog", "streetfood", "drinks"]);

if (!ADMIN_PASSWORD) {
  console.error("ADMIN_PASSWORD is required. Start with: $env:ADMIN_PASSWORD='your-password'; node server.js");
  process.exit(1);
}

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]", "utf8");

function readOrders() {
  try { return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8")); }
  catch { return []; }
}

function writeOrders(orders) {
  const tempFile = ORDERS_FILE + ".tmp";
  fs.writeFileSync(tempFile, JSON.stringify(orders, null, 2), "utf8");
  fs.renameSync(tempFile, ORDERS_FILE);
}

function readProducts() {
  try { return JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf8")); }
  catch { return []; }
}

function writeProducts(products) {
  const tempFile = PRODUCTS_FILE + ".tmp";
  fs.writeFileSync(tempFile, JSON.stringify(products, null, 2), "utf8");
  fs.renameSync(tempFile, PRODUCTS_FILE);
}

async function notifyNewOrder(order) {
  if (!FORMSPREE_ENDPOINT) return;

  const items = order.items.map((item) => {
    const addons = item.addons?.length ? ` (${item.addons.map((addon) => addon.name).join(", ")})` : "";
    return `${item.name}${addons} x${item.qty} - PHP ${Number(item.lineTotal).toFixed(2)}`;
  }).join("\n");
  const customer = order.customer;
  const destination = customer.orderType === "delivery" ? `Delivery: ${customer.address}` : "Pickup";

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `New order ${order.id}`,
        orderNumber: order.id,
        customerName: customer.name,
        phone: customer.phone,
        orderType: destination,
        paymentMethod: order.payment?.method || "Not specified",
        items,
        total: `PHP ${Number(order.total).toFixed(2)}`,
        notes: customer.notes || "",
      }),
    });
    if (!response.ok) throw new Error(`Formspree returned ${response.status}`);
    const result = await response.json().catch(() => ({}));
    console.log(`Order notification sent for ${order.id}:`, result.ok ? "accepted" : result);
  } catch (error) {
    console.error(`Could not send order notification for ${order.id}:`, error.message);
  }
}

function validateProduct(product) {
  return product && typeof product.name === "string" && product.name.trim() &&
    PRODUCT_CATEGORIES.has(product.category) && Number.isFinite(Number(product.price)) && Number(product.price) >= 0 &&
    typeof product.desc === "string" && product.desc.trim() && typeof product.image === "string" && product.image.trim() &&
    (!product.addOns || (Array.isArray(product.addOns) && product.addOns.every((addon) =>
      addon && typeof addon.name === "string" && addon.name.trim() && Number.isFinite(Number(addon.price)) && Number(addon.price) >= 0)));
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    ...headers,
  });
  res.end(JSON.stringify(body));
}

function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || "").split(";").filter(Boolean).map((part) => {
    const index = part.indexOf("=");
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }));
}

function isAuthenticated(req) {
  const token = parseCookies(req).admin_session;
  const expires = sessions.get(token);
  if (!token || !expires || expires < Date.now()) {
    sessions.delete(token);
    return false;
  }
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return true;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; if (data.length > 1e6) reject(new Error("Request too large")); });
    req.on("end", () => { try { resolve(data ? JSON.parse(data) : {}); } catch { reject(new Error("Invalid JSON")); } });
    req.on("error", reject);
  });
}

function serveStatic(req, res) {
  const requested = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const filePath = path.normalize(path.join(__dirname, requested === "/" ? "index.html" : requested));
  if (!filePath.startsWith(__dirname) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404); return res.end("Not found");
  }
  const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };
  res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      return res.end();
    }
    if (req.method === "POST" && url.pathname === "/api/login") {
      const body = await readBody(req);
      if (body.username !== ADMIN_USERNAME || body.password !== ADMIN_PASSWORD) return send(res, 401, { error: "Incorrect username or password." });
      const token = crypto.randomBytes(32).toString("hex");
      sessions.set(token, Date.now() + SESSION_TTL_MS);
      return send(res, 200, { ok: true }, { "Set-Cookie": `admin_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_MS / 1000}` });
    }
    if (req.method === "POST" && url.pathname === "/api/logout") {
      const token = parseCookies(req).admin_session;
      sessions.delete(token);
      return send(res, 200, { ok: true }, { "Set-Cookie": "admin_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0" });
    }
    if (url.pathname === "/api/orders" && req.method === "GET") {
      if (!isAuthenticated(req)) return send(res, 401, { error: "Unauthorized" });
      return send(res, 200, readOrders());
    }
    if (url.pathname === "/api/orders" && req.method === "POST") {
      const order = await readBody(req);
      if (!order.id || !order.customer || !Array.isArray(order.items)) return send(res, 400, { error: "Invalid order" });
      const orders = readOrders();
      orders.unshift(order);
      writeOrders(orders);
      await notifyNewOrder(order);
      return send(res, 201, order);
    }
    if (url.pathname === "/api/products" && req.method === "GET") {
      return send(res, 200, readProducts());
    }
    if (url.pathname === "/api/products" && req.method === "POST") {
      if (!isAuthenticated(req)) return send(res, 401, { error: "Unauthorized" });
      const product = await readBody(req);
      if (!validateProduct(product)) return send(res, 400, { error: "Name, category, description, image, and a valid price are required." });
      const products = readProducts();
      const newProduct = { ...product, id: crypto.randomUUID(), price: Number(product.price), addOns: Array.isArray(product.addOns) ? product.addOns : [] };
      products.push(newProduct);
      writeProducts(products);
      return send(res, 201, newProduct);
    }
    const productMatch = url.pathname.match(/^\/api\/products\/([^/]+)$/);
    if (productMatch && !isAuthenticated(req)) return send(res, 401, { error: "Unauthorized" });
    if (productMatch && req.method === "PATCH") {
      const products = readProducts();
      const index = products.findIndex((item) => item.id === productMatch[1]);
      if (index < 0) return send(res, 404, { error: "Product not found" });
      const product = await readBody(req);
      if (!validateProduct(product)) return send(res, 400, { error: "Name, category, description, image, and a valid price are required." });
      products[index] = { ...products[index], ...product, id: products[index].id, price: Number(product.price), addOns: Array.isArray(product.addOns) ? product.addOns : [] };
      writeProducts(products);
      return send(res, 200, products[index]);
    }
    if (productMatch && req.method === "DELETE") {
      const products = readProducts().filter((item) => item.id !== productMatch[1]);
      writeProducts(products);
      return send(res, 204, {});
    }
    const orderMatch = url.pathname.match(/^\/api\/orders\/([^/]+)$/);
    if (orderMatch && !isAuthenticated(req)) return send(res, 401, { error: "Unauthorized" });
    if (orderMatch && req.method === "PATCH") {
      const orders = readOrders();
      const order = orders.find((item) => item.id === orderMatch[1]);
      if (!order) return send(res, 404, { error: "Order not found" });
      const body = await readBody(req);
      if (!["Pending", "Confirmed", "Preparing", "Ready", "Out for Delivery", "Completed", "Cancelled"].includes(body.status)) return send(res, 400, { error: "Invalid status" });
      order.status = body.status;
      writeOrders(orders);
      return send(res, 200, order);
    }
    if (orderMatch && req.method === "DELETE") {
      const orders = readOrders().filter((item) => item.id !== orderMatch[1]);
      writeOrders(orders);
      return send(res, 204, {});
    }
    if (req.method === "GET") return serveStatic(req, res);
    return send(res, 404, { error: "Not found" });
  } catch (error) {
    console.error(error);
    send(res, 500, { error: "Server error" });
  }
});

server.listen(PORT, () => console.log(`MB Street Food Corner running at http://localhost:${PORT}`));
