const STATUS_OPTIONS = ["Pending", "Confirmed", "Preparing", "Ready", "Out for Delivery", "Completed", "Cancelled"];

let activeStatusFilter = "all";
let activeSearchTerm = "";

async function api(path, options = {}) {
  const response = await fetch(path, { credentials: "same-origin", ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Request failed");
  }
  return response.status === 204 ? null : response.json();
}

async function loadOrders() {
  try { return await api("/api/orders"); }
  catch (error) { showToast(error.message, "error"); return []; }
}

async function loadProducts() {
  return api("/api/products");
}

function formatPHP(amount) {
  return "\u20B1" + Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });
}

function paymentStatus(payment = {}) {
  return payment.status || (payment.method === "cash" ? "Unpaid" : "Paid");
}

/* ============================================================
   AUTH
   ============================================================ */
async function isLoggedIn() {
  try { await api("/api/orders"); return true; }
  catch { return false; }
}

async function login(username, password) {
  await api("/api/login", { method: "POST", body: JSON.stringify({ username, password }) });
}

async function logout() {
  await api("/api/logout", { method: "POST" });
  showLoginScreen();
}

function showLoginScreen() {
  document.getElementById("loginScreen").hidden = false;
  document.getElementById("adminApp").hidden = true;
}

async function showDashboard() {
  document.getElementById("loginScreen").hidden = true;
  document.getElementById("adminApp").hidden = false;
  await renderAll();
}

/* ============================================================
   RENDERING
   ============================================================ */
async function getFilteredOrders() {
  const orders = await loadOrders();
  return orders.filter((order) => {
    const matchesStatus = activeStatusFilter === "all" || order.status === activeStatusFilter;
    const haystack = `${order.id} ${order.customer?.name || ""} ${order.customer?.phone || ""}`.toLowerCase();
    const matchesSearch = haystack.includes(activeSearchTerm);
    return matchesStatus && matchesSearch;
  });
}

async function renderStats() {
  const orders = await loadOrders();
  const total = orders.length;
  const pending = orders.filter((o) => o.status === "Pending").length;
  const completed = orders.filter((o) => o.status === "Completed").length;
  const revenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const stats = [
    { label: "Total Orders", value: total },
    { label: "Pending", value: pending },
    { label: "Completed", value: completed },
    { label: "Revenue (excl. cancelled)", value: formatPHP(revenue) },
  ];

  document.getElementById("adminStats").innerHTML = stats.map((s) => `
    <div class="stat-card">
      <div class="stat-card__value">${s.value}</div>
      <div class="stat-card__label">${s.label}</div>
    </div>
  `).join("");
}

function statusClass(status) {
  return "status-" + status.replace(/\s+/g, "-");
}

async function renderTable() {
  const tbody = document.getElementById("ordersTableBody");
  const emptyMsg = document.getElementById("ordersEmpty");
  const orders = await getFilteredOrders();

  tbody.innerHTML = "";

  if (orders.length === 0) {
    emptyMsg.hidden = false;
    return;
  }
  emptyMsg.hidden = true;

  const paymentLabels = { gcash: "GCash", maya: "Maya", cash: "Cash" };

  orders.forEach((order) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="order-id">${order.id}</td>
      <td>${order.customer?.name || "\u2014"}<br><small>${order.customer?.phone || ""}</small></td>
      <td>${formatDate(order.date)}</td>
      <td>${formatPHP(order.total)}</td>
      <td>
        ${paymentLabels[order.payment?.method] || order.payment?.method || "\u2014"}
        <span class="payment-badge payment-${paymentStatus(order.payment)}">${paymentStatus(order.payment)}</span>
      </td>
      <td>
        <select class="status-select ${statusClass(order.status)}" data-status-select="${order.id}">
          ${STATUS_OPTIONS.map((s) => `<option value="${s}" ${s === order.status ? "selected" : ""}>${s}</option>`).join("")}
        </select>
      </td>
      <td class="row-actions">
        <button class="icon-btn" data-view-order="${order.id}" aria-label="View order ${order.id}" title="View details">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
        </button>
        <button class="icon-btn icon-btn--danger" data-delete-order="${order.id}" aria-label="Delete order ${order.id}" title="Delete order">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0 1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function renderAll() {
  await renderStats();
  await renderTable();
  await renderProducts();
}

function parseAddOns(value) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean).map((line, index) => {
    const [name, price] = line.split("|").map((part) => part.trim());
    return { id: `addon-${Date.now()}-${index}`, name, price: Number(price || 0) };
  });
}

function productAddOnsText(addOns = []) {
  return addOns.map((addon) => `${addon.name} | ${addon.price}`).join("\n");
}

async function renderProducts() {
  const tbody = document.getElementById("productsTableBody");
  const empty = document.getElementById("productsEmpty");
  try {
    const products = await loadProducts();
    tbody.innerHTML = products.map((product) => `
      <tr>
        <td><strong>${product.name}</strong><br><small>${product.desc}</small></td>
        <td>${product.category}</td>
        <td>${formatPHP(product.price)}</td>
        <td>${(product.addOns || []).map((addon) => `${addon.name} (+${formatPHP(addon.price)})`).join(", ") || "\u2014"}</td>
        <td class="row-actions"><button class="icon-btn" data-edit-product="${product.id}" aria-label="Edit ${product.name}" title="Edit product">&#9998;</button><button class="icon-btn icon-btn--danger" data-delete-product="${product.id}" aria-label="Delete ${product.name}" title="Delete product">&#128465;</button></td>
      </tr>
    `).join("");
    empty.hidden = products.length > 0;
  } catch (error) { showToast(error.message, "error"); }
}

function resetProductForm() {
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
  document.getElementById("productError").textContent = "";
  document.getElementById("productForm").hidden = true;
}

async function editProduct(productId) {
  const product = (await loadProducts()).find((item) => item.id === productId);
  if (!product) return;
  document.getElementById("productId").value = product.id;
  document.getElementById("productName").value = product.name;
  document.getElementById("productCategory").value = product.category;
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productImage").value = product.image;
  document.getElementById("productDescription").value = product.desc;
  document.getElementById("productAddOns").value = productAddOnsText(product.addOns);
  document.getElementById("productForm").hidden = false;
  document.getElementById("productName").focus();
}

async function saveProduct(event) {
  event.preventDefault();
  const productId = document.getElementById("productId").value;
  const product = {
    name: document.getElementById("productName").value.trim(),
    category: document.getElementById("productCategory").value,
    price: Number(document.getElementById("productPrice").value),
    image: document.getElementById("productImage").value.trim(),
    desc: document.getElementById("productDescription").value.trim(),
    addOns: parseAddOns(document.getElementById("productAddOns").value),
  };
  try {
    await api(productId ? `/api/products/${encodeURIComponent(productId)}` : "/api/products", { method: productId ? "PATCH" : "POST", body: JSON.stringify(product) });
    resetProductForm();
    await renderProducts();
    showToast("Product saved.", "success");
  } catch (error) { document.getElementById("productError").textContent = error.message; }
}

async function deleteProduct(productId) {
  if (!confirm("Delete this product from the menu?")) return;
  try {
    await api(`/api/products/${encodeURIComponent(productId)}`, { method: "DELETE" });
    await renderProducts();
    showToast("Product deleted.", "success");
  } catch (error) { showToast(error.message, "error"); }
}

/* ============================================================
   ORDER DETAILS MODAL
   ============================================================ */
async function openOrderDetail(orderId) {
  const order = (await loadOrders()).find((o) => o.id === orderId);
  if (!order) return;

  const paymentLabels = { gcash: "GCash", maya: "Maya", cash: "Cash on Pickup / Delivery" };

  document.getElementById("orderDetailTitle").textContent = `Order ${order.id}`;
  document.getElementById("orderDetailBody").innerHTML = `
    <div class="detail-section">
      <h4>Customer</h4>
      <p>${order.customer?.name || ""} &mdash; ${order.customer?.phone || ""}</p>
      <p>${order.customer?.orderType === "delivery" ? "Delivery to: " + (order.customer?.address || "") : "Pickup at store"}</p>
      ${order.customer?.notes ? `<p>Notes: ${order.customer.notes}</p>` : ""}
    </div>
    <div class="detail-section">
      <h4>Items</h4>
      ${(order.items || []).map((item) => `
        <div class="detail-item-row">
          <span>${item.name} x${item.qty}${item.addons?.length ? " (" + item.addons.map(a => a.name).join(", ") + ")" : ""}</span>
          <span>${formatPHP(item.lineTotal)}</span>
        </div>
      `).join("")}
    </div>
    <div class="detail-section">
      <h4>Payment</h4>
      <p>${paymentLabels[order.payment?.method] || ""} &mdash; <strong class="payment-${paymentStatus(order.payment)}">${paymentStatus(order.payment)}</strong></p>
      ${order.payment?.reference ? `<p>Reference #: ${order.payment.reference}</p>` : ""}
      ${order.payment?.proofFileName ? `<p>Screenshot: ${order.payment.proofFileName}</p>` : ""}
    </div>
    <div class="detail-total">
      <span>Total</span>
      <span>${formatPHP(order.total)}</span>
    </div>
  `;

  document.getElementById("orderDetailOverlay").hidden = false;
}

function closeOrderDetail() {
  document.getElementById("orderDetailOverlay").hidden = true;
}

/* ============================================================
   ORDER ACTIONS
   ============================================================ */
async function updateOrderStatus(orderId, newStatus) {
  try {
    await api(`/api/orders/${encodeURIComponent(orderId)}`, { method: "PATCH", body: JSON.stringify({ status: newStatus }) });
    await renderAll();
    showToast(`${orderId} marked as ${newStatus}.`, "success");
  } catch (error) { showToast(error.message, "error"); }
}

async function deleteOrder(orderId) {
  if (!confirm(`Delete order ${orderId}? This cannot be undone.`)) return;
  try {
    await api(`/api/orders/${encodeURIComponent(orderId)}`, { method: "DELETE" });
    await renderAll();
    showToast(`${orderId} deleted.`, "success");
  } catch (error) { showToast(error.message, "error"); }
}

/* ============================================================
   TOASTS
   ============================================================ */
function showToast(message, type) {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast" + (type === "error" ? " toast--error" : type === "success" ? " toast--success" : "");
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2900);
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
  if (await isLoggedIn()) {
    await showDashboard();
  } else {
    showLoginScreen();
  }

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("adminUsername").value.trim();
    const password = document.getElementById("adminPassword").value;
    const errorEl = document.getElementById("loginError");

    try {
      await login(username, password);
      errorEl.textContent = "";
      document.getElementById("loginForm").reset();
      await showDashboard();
    } catch (error) {
      errorEl.textContent = "Incorrect username or password.";
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", logout);

  document.getElementById("orderSearch").addEventListener("input", (e) => {
    activeSearchTerm = e.target.value.trim().toLowerCase();
    renderTable();
  });

  document.getElementById("statusFilter").addEventListener("change", (e) => {
    activeStatusFilter = e.target.value;
    renderTable();
  });

  document.getElementById("ordersTableBody").addEventListener("change", (e) => {
    const orderId = e.target.closest("[data-status-select]")?.dataset.statusSelect;
    if (orderId) updateOrderStatus(orderId, e.target.value);
  });

  document.getElementById("ordersTableBody").addEventListener("click", (e) => {
    const viewId = e.target.closest("[data-view-order]")?.dataset.viewOrder;
    if (viewId) return openOrderDetail(viewId);
    const deleteId = e.target.closest("[data-delete-order]")?.dataset.deleteOrder;
    if (deleteId) return deleteOrder(deleteId);
  });

  document.getElementById("newProductBtn").addEventListener("click", () => {
    resetProductForm();
    document.getElementById("productForm").hidden = false;
    document.getElementById("productName").focus();
  });
  document.getElementById("cancelProductBtn").addEventListener("click", resetProductForm);
  document.getElementById("productForm").addEventListener("submit", saveProduct);
  document.getElementById("productsTableBody").addEventListener("click", (e) => {
    const editId = e.target.closest("[data-edit-product]")?.dataset.editProduct;
    if (editId) return editProduct(editId);
    const deleteId = e.target.closest("[data-delete-product]")?.dataset.deleteProduct;
    if (deleteId) return deleteProduct(deleteId);
  });

  document.getElementById("orderDetailClose").addEventListener("click", closeOrderDetail);
  document.getElementById("orderDetailOverlay").addEventListener("click", (e) => {
    if (e.target.id === "orderDetailOverlay") closeOrderDetail();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !document.getElementById("orderDetailOverlay").hidden) {
      closeOrderDetail();
    }
  });
});
