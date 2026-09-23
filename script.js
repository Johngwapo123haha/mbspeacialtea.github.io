/* ==========================================================================
   MB STREET FOOD CORNER — MAIN SCRIPT
   ==========================================================================
   Sections in this file:
   1. EDITABLE BUSINESS SETTINGS   <-- change contact info / social links here
   2. PRODUCT DATA                 <-- change food names / prices / images here
   3. STATE + LOCALSTORAGE HELPERS
   4. MENU RENDERING (filter + search)
   5. PRODUCT MODAL
   6. CART LOGIC
   7. NAVBAR / MOBILE MENU / SMOOTH SCROLL
   8. CHECKOUT FLOW (form -> review -> confirmation)
   9. TOASTS
   10. INIT
   ========================================================================== */

/* ============================================================
   1. EDITABLE BUSINESS SETTINGS
   Change these values to match your real business information.
   ============================================================ */
const BUSINESS_NAME = "MB Street Food Corner";
const BUSINESS_PHONE = "+639000000000";          // used for the "tel:" link — digits only after +63
const BUSINESS_EMAIL = "hello@mbstreetfoodcorner.com";
const BUSINESS_ADDRESS = "Purok Sunflower, Consolacion, Cebu, Philippines";
const BUSINESS_HOURS = "Mon \u2013 Sun: 10:00 AM \u2013 10:00 PM";

// EDIT: put your real Facebook Page URL here
const BUSINESS_FACEBOOK = "YOUR FACEBOOK URL HERE";
// EDIT: put your real Messenger link here (e.g. https://m.me/yourpage)
const BUSINESS_MESSENGER = "YOUR MESSENGER URL HERE";

/* ============================================================
   2. PRODUCT DATA
   Add, remove, or edit products here. Each product needs:
   id, name, category, price (in PHP, numbers only), desc, image.
   "addOns" is optional — an array of { id, name, price }.
   Category keys must match the data-category values used in the
  HTML filter buttons: milktea, silog, streetfood, drinks.
   ============================================================ */
let PRODUCTS = [
  // ---------------- MILK TEA ----------------
  { id: "mt1", category: "milktea", name: "Classic Milk Tea", price: 49,
    desc: "Our house-blend black tea with creamer and tapioca pearls.",
    image: "images/milktea.jpg",
    addOns: [{ id: "mt1a", name: "Extra Pearls", price: 10 }, { id: "mt1b", name: "Less Sugar", price: 0 }] },
  { id: "mt2", category: "milktea", name: "Wintermelon Milk Tea", price: 59,
    desc: "Sweet wintermelon tea, smooth and refreshing.",
    image: "images/milktea.jpg",
    addOns: [{ id: "mt2a", name: "Extra Pearls", price: 10 }, { id: "mt2b", name: "Nata de Coco", price: 10 }] },
  { id: "mt3", category: "milktea", name: "Taro Milk Tea", price: 59,
    desc: "Creamy taro-flavored milk tea, a customer favorite.",
    image: "images/milktea.jpg",
    addOns: [{ id: "mt3a", name: "Extra Pearls", price: 10 }] },
  { id: "mt4", category: "milktea", name: "Okinawa Milk Tea", price: 65,
    desc: "Brown sugar milk tea with a caramelized finish.",
    image: "images/milktea.jpg",
    addOns: [{ id: "mt4a", name: "Extra Pearls", price: 10 }, { id: "mt4b", name: "Cheese Foam", price: 15 }] },

  // ---------------- SILOG / MEALS ----------------
  { id: "sg1", category: "silog", name: "Tapsilog", price: 89,
    desc: "Beef tapa, garlic rice, and fried egg.",
    image: "images/silog.jpg" },
  { id: "sg2", category: "silog", name: "Porksilog", price: 85,
    desc: "Marinated pork chop, garlic rice, and fried egg.",
    image: "images/silog.jpg" },
  { id: "sg3", category: "silog", name: "Hotsilog", price: 65,
    desc: "Hotdog, garlic rice, and fried egg.",
    image: "images/silog.jpg" },
  { id: "sg4", category: "silog", name: "Bangsilog", price: 95,
    desc: "Crispy boneless bangus, garlic rice, and fried egg.",
    image: "images/silog.jpg" },

  // ---------------- STREET FOOD ----------------
  { id: "sf1", category: "streetfood", name: "Kwek-Kwek (6 pcs)", price: 35,
    desc: "Quail eggs in orange batter, deep fried and crispy.",
    image: "images/streetfood.jpg" },
  { id: "sf2", category: "streetfood", name: "Fishball (20 pcs)", price: 25,
    desc: "Classic fishballs, served with sweet and spicy sauce.",
    image: "images/streetfood.jpg" },
  { id: "sf3", category: "streetfood", name: "Isaw (10 sticks)", price: 40,
    desc: "Grilled chicken intestines basted in our house sauce.",
    image: "images/streetfood.jpg" },
  { id: "sf4", category: "streetfood", name: "Chicken Skin (10 pcs)", price: 45,
    desc: "Crispy fried chicken skin skewers.",
    image: "images/streetfood.jpg" },

  // ---------------- STREET FOOD ----------------
  { id: "sf5", category: "streetfood", name: "Siomai (6 pcs)", price: 45,
    desc: "Steamed pork siomai served with calamansi soy sauce.",
    image: "images/snacks.jpg" },

  { id: "sf6", category: "streetfood", name: "Classic Salted Fries", price: 49,
    desc: "Crispy golden fries with a sprinkle of sea salt.",
    image: "images/fries.jpg",
    addOns: [{ id: "sf6a", name: "Cheese Dip", price: 15 }, { id: "sf6b", name: "Gravy", price: 15 }] },
  { id: "sf7", category: "streetfood", name: "Cheese Fries", price: 59,
    desc: "Fries loaded with melted cheese sauce.",
    image: "images/fries.jpg" },
  { id: "sf8", category: "streetfood", name: "Sour Cream Fries", price: 59,
    desc: "Fries tossed in a tangy sour cream seasoning.",
    image: "images/fries.jpg" },
  { id: "sf9", category: "streetfood", name: "Loaded Bacon Fries", price: 89,
    desc: "Cheese fries topped with bacon bits and spring onions.",
    image: "images/fries.jpg" },

  // ---------------- DRINKS ----------------
  { id: "dr1", category: "drinks", name: "Bottled Water", price: 20,
    desc: "500ml bottled water.",
    image: "images/drinks.jpg" },
  { id: "dr2", category: "drinks", name: "Softdrinks", price: 25,
    desc: "Ice-cold soda in a can.",
    image: "images/drinks.jpg" },
  { id: "dr3", category: "drinks", name: "Fresh Lemonade", price: 39,
    desc: "Freshly squeezed lemonade, made daily.",
    image: "images/drinks.jpg" },
  { id: "dr4", category: "drinks", name: "Iced Coffee", price: 45,
    desc: "Cold brewed coffee over ice with creamer.",
    image: "images/drinks.jpg" },
];

const CATEGORY_LABELS = {
  all: "All",
  milktea: "Milk Tea",
  silog: "Silog / Meals",
  streetfood: "Street Food",
  drinks: "Drinks",
};

/* ============================================================
   3. STATE + LOCALSTORAGE HELPERS
   ============================================================ */
const CART_KEY = "mb_cart";
const API_BASE = window.location.port === "5501" ? "" : "http://localhost:5501";

let cart = loadCart();
let activeCategory = "all";
let activeSearch = "";
let currentModalProduct = null;
let pendingOrder = null; // holds order data between "review" and "confirm" steps

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Could not read cart from localStorage:", e);
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error("Could not save cart to localStorage:", e);
    showToast("Could not save your cart on this device.", "error");
  }
}

function formatPHP(amount) {
  return "\u20B1" + amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE}/api/products`);
    if (!response.ok) throw new Error("Could not load products.");
    const products = await response.json();
    if (Array.isArray(products)) PRODUCTS = products;
  } catch (error) {
    console.error(error);
    showToast("Using the saved menu while products are unavailable.", "error");
  }
}

/* ============================================================
   4. MENU RENDERING (filter + search)
   ============================================================ */
function getFilteredProducts() {
  return PRODUCTS.filter((p) => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(activeSearch) ||
                           p.desc.toLowerCase().includes(activeSearch);
    return matchesCategory && matchesSearch;
  });
}

function renderMenu() {
  const grid = document.getElementById("menuGrid");
  const emptyMsg = document.getElementById("menuEmpty");
  const products = getFilteredProducts();

  grid.innerHTML = "";

  if (products.length === 0) {
    emptyMsg.hidden = false;
    return;
  }
  emptyMsg.hidden = true;

  products.forEach((p) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-card__img-wrap" data-open-product="${p.id}">
        <span class="product-card__cat-tag">${CATEGORY_LABELS[p.category]}</span>
        <img src="${p.image}" alt="${p.name}" loading="lazy"
             onerror="this.onerror=null;this.src='images/streetfood.jpg';">
      </div>
      <div class="product-card__body">
        <h3 class="product-card__name" data-open-product="${p.id}">${p.name}</h3>
        <p class="product-card__desc">${p.desc}</p>
        <p class="product-card__price">${formatPHP(p.price)}</p>
        <div class="product-card__footer">
          <div class="qty-control" data-qty-for="${p.id}">
            <button type="button" data-qty-minus="${p.id}" aria-label="Decrease quantity">&minus;</button>
            <input type="number" value="1" min="1" max="50" data-qty-input="${p.id}" aria-label="Quantity for ${p.name}">
            <button type="button" data-qty-plus="${p.id}" aria-label="Increase quantity">+</button>
          </div>
          <button class="add-cart-btn" data-add-to-cart="${p.id}">Add to Cart</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderCategoryButtons() {
  const wrap = document.getElementById("menuCategories");
  wrap.querySelectorAll(".cat-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.category === activeCategory);
  });
}

/* ============================================================
   5. PRODUCT MODAL
   ============================================================ */
function openProductModal(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;
  currentModalProduct = product;

  document.getElementById("productModalImage").src = product.image;
  document.getElementById("productModalImage").alt = product.name;
  document.getElementById("productModalTitle").textContent = product.name;
  document.getElementById("productModalDesc").textContent = product.desc;
  document.getElementById("productModalPrice").textContent = formatPHP(product.price);
  document.getElementById("productModalQty").value = 1;

  const addonsWrap = document.getElementById("productModalAddons");
  addonsWrap.innerHTML = "";
  if (product.addOns && product.addOns.length) {
    const heading = document.createElement("p");
    heading.style.fontWeight = "600";
    heading.style.fontSize = ".88rem";
    heading.style.color = "var(--green-900)";
    heading.textContent = "Optional add-ons:";
    addonsWrap.appendChild(heading);

    product.addOns.forEach((addon) => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="checkbox" value="${addon.id}" data-addon-checkbox>
        <span>${addon.name}${addon.price > 0 ? " (+" + formatPHP(addon.price) + ")" : " (free)"}</span>
      `;
      addonsWrap.appendChild(label);
    });
  }

  document.getElementById("productModalOverlay").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeProductModal() {
  document.getElementById("productModalOverlay").hidden = true;
  document.body.style.overflow = "";
  currentModalProduct = null;
}

function addModalProductToCart() {
  if (!currentModalProduct) return;
  const qty = Math.max(1, parseInt(document.getElementById("productModalQty").value, 10) || 1);
  const checkedAddons = Array.from(document.querySelectorAll("[data-addon-checkbox]:checked")).map((cb) => {
    return currentModalProduct.addOns.find((a) => a.id === cb.value);
  }).filter(Boolean);

  addToCart(currentModalProduct, qty, checkedAddons);
  closeProductModal();
}

/* ============================================================
   6. CART LOGIC
   ============================================================ */
function cartLineKey(productId, addons) {
  const addonIds = (addons || []).map((a) => a.id).sort().join(",");
  return productId + "::" + addonIds;
}

function addToCart(product, qty, addons) {
  addons = addons || [];
  const key = cartLineKey(product.id, addons);
  const existing = cart.find((item) => item.key === key);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      key,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty,
      addons,
    });
  }
  saveCart();
  renderCart();
  showToast(`${product.name} added to cart.`, "success");
}

function updateCartQty(key, delta) {
  const item = cart.find((i) => i.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.key !== key);
  }
  saveCart();
  renderCart();
}

function removeCartItem(key) {
  cart = cart.filter((i) => i.key !== key);
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

function lineTotal(item) {
  const addonsTotal = (item.addons || []).reduce((sum, a) => sum + a.price, 0);
  return (item.price + addonsTotal) * item.qty;
}

function cartSubtotal() {
  return cart.reduce((sum, item) => sum + lineTotal(item), 0);
}

function cartItemCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function renderCart() {
  const wrap = document.getElementById("cartItems");
  const emptyMsg = document.getElementById("cartEmptyMsg");
  const subtotalEl = document.getElementById("cartSubtotal");
  const countBadgeTop = document.getElementById("cartCount");
  const countBadgeFloat = document.getElementById("floatingCartCount");

  wrap.innerHTML = "";

  if (cart.length === 0) {
    emptyMsg.hidden = false;
  } else {
    emptyMsg.hidden = true;
    cart.forEach((item) => {
      const addonText = (item.addons || []).map((a) => a.name).join(", ");
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null;this.src='images/streetfood.jpg';">
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          ${addonText ? `<div class="cart-item__addons">+ ${addonText}</div>` : ""}
          <div class="cart-item__price">${formatPHP(lineTotal(item))}</div>
        </div>
        <div class="cart-item__actions">
          <button class="cart-item__remove" data-remove-item="${item.key}">Remove</button>
          <div class="qty-control">
            <button type="button" data-cart-minus="${item.key}" aria-label="Decrease quantity">&minus;</button>
            <span style="min-width:20px;text-align:center;display:inline-block;">${item.qty}</span>
            <button type="button" data-cart-plus="${item.key}" aria-label="Increase quantity">+</button>
          </div>
        </div>
      `;
      wrap.appendChild(row);
    });
  }

  subtotalEl.textContent = formatPHP(cartSubtotal());
  const count = cartItemCount();
  countBadgeTop.textContent = count;
  countBadgeFloat.textContent = count;
}

function openCart() {
  document.getElementById("cartOverlay").hidden = false;
  document.getElementById("cartDrawer").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeCart() {
  document.getElementById("cartOverlay").hidden = true;
  document.getElementById("cartDrawer").hidden = true;
  document.body.style.overflow = "";
}

/* ============================================================
   7. NAVBAR / MOBILE MENU / SMOOTH SCROLL
   ============================================================ */
function toggleMobileNav(forceClose) {
  const nav = document.getElementById("navMenu");
  const btn = document.getElementById("hamburgerBtn");
  const shouldOpen = forceClose ? false : !nav.classList.contains("is-open");
  nav.classList.toggle("is-open", shouldOpen);
  btn.classList.toggle("is-open", shouldOpen);
  btn.setAttribute("aria-expanded", String(shouldOpen));
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

/* ============================================================
   8. CHECKOUT FLOW
   ============================================================ */
function openCheckout() {
  if (cart.length === 0) {
    showToast("Your cart is empty. Add something before checking out.", "error");
    return;
  }
  closeCart();
  document.getElementById("checkoutOverlay").hidden = false;
  document.getElementById("checkoutStepForm").hidden = false;
  document.getElementById("checkoutStepPayment").hidden = true;
  document.getElementById("checkoutStepReview").hidden = true;
  document.body.style.overflow = "hidden";
  updatePaymentAmounts();
}

function closeCheckout() {
  document.getElementById("checkoutOverlay").hidden = true;
  document.body.style.overflow = "";
}

function updatePaymentAmounts() {
  const total = formatPHP(cartSubtotal());
  document.getElementById("gcashAmount").textContent = total;
  document.getElementById("mayaAmount").textContent = total;
}

function handleOrderTypeChange() {
  const type = document.getElementById("orderType").value;
  const addressRow = document.getElementById("addressRow");
  addressRow.style.display = type === "delivery" ? "flex" : "none";
  if (type !== "delivery") {
    document.getElementById("custAddress").value = "";
    document.getElementById("custAddressError").textContent = "";
  }
}

function handlePaymentMethodChange() {
  const method = document.querySelector('input[name="paymentMethod"]:checked').value;
  document.getElementById("gcashPanel").hidden = true;
  document.getElementById("mayaPanel").hidden = true;
  document.getElementById("cashPanel").hidden = method !== "cash";
}

function clearFormErrors() {
  document.querySelectorAll(".form-error").forEach((el) => (el.textContent = ""));
  document.querySelectorAll(".field-invalid").forEach((el) => el.classList.remove("field-invalid"));
}

function setFieldError(inputId, errorId, message) {
  document.getElementById(errorId).textContent = message;
  document.getElementById(inputId).classList.add("field-invalid");
}

function validateCheckoutForm(requirePaymentReference = true) {
  clearFormErrors();
  let isValid = true;

  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const orderType = document.getElementById("orderType").value;
  const address = document.getElementById("custAddress").value.trim();
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

  if (!name) {
    setFieldError("custName", "custNameError", "Please enter your full name.");
    isValid = false;
  }

  // Simple PH mobile number check: starts with 09 or +639, 10-13 digits total
  const phoneDigits = phone.replace(/\D/g, "");
  const validPhone = /^(09\d{9}|639\d{9})$/.test(phoneDigits);
  if (!phone) {
    setFieldError("custPhone", "custPhoneError", "Please enter your mobile number.");
    isValid = false;
  } else if (!validPhone) {
    setFieldError("custPhone", "custPhoneError", "Please enter a valid PH mobile number (e.g. 09171234567).");
    isValid = false;
  }

  if (orderType === "delivery" && !address) {
    setFieldError("custAddress", "custAddressError", "Please enter your delivery address.");
    isValid = false;
  }

  if (requirePaymentReference && paymentMethod === "gcash") {
    const ref = document.getElementById("gcashRef").value.trim();
    if (!ref) {
      setFieldError("gcashRef", "gcashRefError", "Please enter your GCash reference number.");
      isValid = false;
    }
  }
  if (requirePaymentReference && paymentMethod === "maya") {
    const ref = document.getElementById("mayaRef").value.trim();
    if (!ref) {
      setFieldError("mayaRef", "mayaRefError", "Please enter your Maya reference number.");
      isValid = false;
    }
  }

  if (cart.length === 0) {
    showToast("Your cart is empty.", "error");
    isValid = false;
  }

  return isValid;
}

function buildOrderFromForm() {
  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const orderType = document.getElementById("orderType").value;
  const address = document.getElementById("custAddress").value.trim();
  const notes = document.getElementById("custNotes").value.trim();
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

  let reference = "";
  let proofFileName = "";
  if (paymentMethod === "gcash") {
    reference = document.getElementById("gcashRef").value.trim();
    proofFileName = document.getElementById("gcashProof").files[0]?.name || "";
  } else if (paymentMethod === "maya") {
    reference = document.getElementById("mayaRef").value.trim();
    proofFileName = document.getElementById("mayaProof").files[0]?.name || "";
  }

  return {
    customer: { name, phone, orderType, address, notes },
    payment: {
      method: paymentMethod,
      reference,
      proofFileName,
      status: paymentMethod === "cash" ? "Unpaid" : "Paid",
    },
    items: cart.map((item) => ({
      name: item.name,
      qty: item.qty,
      price: item.price,
      addons: item.addons || [],
      lineTotal: lineTotal(item),
    })),
    subtotal: cartSubtotal(),
    total: cartSubtotal(),
  };
}

function goToReview() {
  if (!validateCheckoutForm(false)) {
    showToast("Please fix the highlighted fields.", "error");
    return;
  }

  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  if (paymentMethod === "cash") {
    pendingOrder = buildOrderFromForm();
    confirmOrder();
    return;
  }

  document.getElementById("paymentStepAmount").textContent = formatPHP(cartSubtotal());
  document.getElementById("paymentStepReference").value = "";
  document.getElementById("paymentStepReferenceError").textContent = "";
  document.getElementById("checkoutStepForm").hidden = true;
  document.getElementById("checkoutStepPayment").hidden = false;
  document.getElementById("checkoutStepReview").hidden = true;
  document.getElementById("paymentStepReference").focus();
}

function backToCheckoutForm() {
  document.getElementById("checkoutStepForm").hidden = false;
  document.getElementById("checkoutStepPayment").hidden = true;
  document.getElementById("checkoutStepReview").hidden = true;
}

function completePaidOrder() {
  const reference = document.getElementById("paymentStepReference").value.trim();
  const error = document.getElementById("paymentStepReferenceError");
  error.textContent = reference ? "" : "Enter your payment reference number after paying.";
  if (!reference) return;

  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  document.getElementById(paymentMethod === "gcash" ? "gcashRef" : "mayaRef").value = reference;
  pendingOrder = buildOrderFromForm();
  confirmOrder();
}

function backToForm() {
  document.getElementById("checkoutStepForm").hidden = false;
  document.getElementById("checkoutStepReview").hidden = true;
}

function renderReview(order) {
  const custEl = document.getElementById("reviewCustomer");
  custEl.innerHTML = `
    <p><strong>${order.customer.name}</strong></p>
    <p>${order.customer.phone}</p>
    <p>${order.customer.orderType === "delivery" ? "Delivery" : "Pickup"}${order.customer.orderType === "delivery" ? " &mdash; " + order.customer.address : ""}</p>
    ${order.customer.notes ? `<p>Notes: ${order.customer.notes}</p>` : ""}
  `;

  const itemsEl = document.getElementById("reviewItems");
  itemsEl.innerHTML = order.items.map((item) => `
    <div class="review-item-row">
      <span>${item.name} x${item.qty}${item.addons.length ? " (" + item.addons.map(a => a.name).join(", ") + ")" : ""}</span>
      <span>${formatPHP(item.lineTotal)}</span>
    </div>
  `).join("");

  const paymentLabels = { gcash: "GCash", maya: "Maya", cash: "Cash on Pickup / Delivery" };
  const payEl = document.getElementById("reviewPayment");
  payEl.innerHTML = `
    <p><strong>${paymentLabels[order.payment.method]}</strong></p>
    ${order.payment.reference ? `<p>Reference #: ${order.payment.reference}</p>` : ""}
    ${order.payment.proofFileName ? `<p>Screenshot: ${order.payment.proofFileName}</p>` : ""}
  `;

  document.getElementById("reviewTotal").textContent = formatPHP(order.total);
}

function generateOrderNumber() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `MB-${random}`;
}

async function confirmOrder() {
  if (!pendingOrder) return;

  const order = {
    ...pendingOrder,
    id: generateOrderNumber(),
    date: new Date().toISOString(),
    status: "Pending",
  };

  try {
    const response = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      throw new Error(details.error || `Could not submit your order (${response.status}).`);
    }
  } catch (error) {
    showToast(error.message, "error");
    return;
  }

  showConfirmation(order);

  // Reset cart + form after successful order
  clearCart();
  document.getElementById("checkoutForm").reset();
  clearFormErrors();
  handleOrderTypeChange();
  handlePaymentMethodChange();
  pendingOrder = null;

  closeCheckout();
}

function showConfirmation(order) {
  closeCart();
  closeCheckout();
  document.getElementById("confirmOrderNumber").textContent = `Order #${order.id}`;

  document.getElementById("confirmCustomer").innerHTML = `
    <h4>Customer Information</h4>
    <p><strong>${order.customer.name}</strong> &mdash; ${order.customer.phone}</p>
    <p>${order.customer.orderType === "delivery" ? "Delivery to: " + order.customer.address : "Pickup at store"}</p>
    ${order.customer.notes ? `<p>Notes: ${order.customer.notes}</p>` : ""}
  `;

  const paymentLabels = { gcash: "GCash", maya: "Maya", cash: "Cash on Pickup / Delivery" };
  document.getElementById("confirmItems").innerHTML = `
    <h4>Order Items</h4>
    ${order.items.map((item) => `
      <div class="confirm-item-row">
        <span>${item.name} x${item.qty}${item.addons.length ? " (" + item.addons.map(a => a.name).join(", ") + ")" : ""}</span>
        <span>${formatPHP(item.lineTotal)}</span>
      </div>
    `).join("")}
  `;

  document.getElementById("confirmPayment").innerHTML = `
    <h4>Payment Method</h4>
    <p>${paymentLabels[order.payment.method]}${order.payment.reference ? " &mdash; Ref #: " + order.payment.reference : ""}</p>
  `;

  document.getElementById("confirmTotal").textContent = formatPHP(order.total);

  document.getElementById("confirmationOverlay").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeConfirmation() {
  document.getElementById("confirmationOverlay").hidden = true;
  closeCart();
  document.body.style.overflow = "";
}

function downloadOrderAsText() {
  const text = document.getElementById("printableOrder").innerText;
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const orderNum = document.getElementById("confirmOrderNumber").textContent.replace(/\D/g, "");
  a.href = url;
  a.download = `MB-Order-${orderNum || "receipt"}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ============================================================
   9. TOASTS
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
   10. INIT — wire up all event listeners
   ============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
  // ---- Contact info + social links from settings above ----
  document.getElementById("contactAddress").textContent = BUSINESS_ADDRESS;
  document.getElementById("contactPhone").textContent = "+63 " + BUSINESS_PHONE.replace("+63", "").replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  document.getElementById("contactPhone").href = "tel:" + BUSINESS_PHONE;
  document.getElementById("contactEmail").textContent = BUSINESS_EMAIL;
  document.getElementById("contactEmail").href = "mailto:" + BUSINESS_EMAIL;
  document.getElementById("contactHours").textContent = BUSINESS_HOURS;
  document.getElementById("facebookLink").href = BUSINESS_FACEBOOK || "#";
  document.getElementById("messengerLink").href = BUSINESS_MESSENGER || "#";
  document.getElementById("footerYear").textContent = new Date().getFullYear();

  // ---- Initial render ----
  await loadProducts();
  renderMenu();
  renderCategoryButtons();
  renderCart();
  handleOrderTypeChange();
  handlePaymentMethodChange();

  // ---- Mobile nav ----
  document.getElementById("hamburgerBtn").addEventListener("click", () => toggleMobileNav());
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => toggleMobileNav(true));
  });

  // ---- Hero buttons ----
  document.getElementById("orderNowBtn").addEventListener("click", () => scrollToSection("menu"));
  document.getElementById("viewMenuBtn").addEventListener("click", () => scrollToSection("menu"));

  // ---- Menu search ----
  document.getElementById("menuSearch").addEventListener("input", (e) => {
    activeSearch = e.target.value.trim().toLowerCase();
    renderMenu();
  });

  // ---- Category filter buttons ----
  document.getElementById("menuCategories").addEventListener("click", (e) => {
    const btn = e.target.closest(".cat-btn");
    if (!btn) return;
    activeCategory = btn.dataset.category;
    renderCategoryButtons();
    renderMenu();
  });

  // ---- Menu grid: open modal / quantity / add to cart (event delegation) ----
  document.getElementById("menuGrid").addEventListener("click", (e) => {
    const openId = e.target.closest("[data-open-product]")?.dataset.openProduct;
    if (openId) return openProductModal(openId);

    const plusId = e.target.closest("[data-qty-plus]")?.dataset.qtyPlus;
    if (plusId) {
      const input = document.querySelector(`[data-qty-input="${plusId}"]`);
      input.value = Math.min(50, (parseInt(input.value, 10) || 1) + 1);
      return;
    }
    const minusId = e.target.closest("[data-qty-minus]")?.dataset.qtyMinus;
    if (minusId) {
      const input = document.querySelector(`[data-qty-input="${minusId}"]`);
      input.value = Math.max(1, (parseInt(input.value, 10) || 1) - 1);
      return;
    }
    const addId = e.target.closest("[data-add-to-cart]")?.dataset.addToCart;
    if (addId) {
      const product = PRODUCTS.find((p) => p.id === addId);
      const input = document.querySelector(`[data-qty-input="${addId}"]`);
      const qty = Math.max(1, parseInt(input.value, 10) || 1);
      addToCart(product, qty, []);
      input.value = 1;
    }
  });

  // ---- Product modal ----
  document.getElementById("productModalClose").addEventListener("click", closeProductModal);
  document.getElementById("productModalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "productModalOverlay") closeProductModal();
  });
  document.getElementById("productModalMinus").addEventListener("click", () => {
    const input = document.getElementById("productModalQty");
    input.value = Math.max(1, (parseInt(input.value, 10) || 1) - 1);
  });
  document.getElementById("productModalPlus").addEventListener("click", () => {
    const input = document.getElementById("productModalQty");
    input.value = Math.min(50, (parseInt(input.value, 10) || 1) + 1);
  });
  document.getElementById("productModalAddBtn").addEventListener("click", addModalProductToCart);

  // ---- Cart open/close ----
  document.getElementById("cartBtn").addEventListener("click", openCart);
  document.getElementById("floatingCartBtn").addEventListener("click", openCart);
  document.getElementById("cartDrawerClose").addEventListener("click", closeCart);
  document.getElementById("cartOverlay").addEventListener("click", closeCart);

  // ---- Cart item actions (event delegation) ----
  document.getElementById("cartItems").addEventListener("click", (e) => {
    const plusKey = e.target.closest("[data-cart-plus]")?.dataset.cartPlus;
    if (plusKey) return updateCartQty(plusKey, 1);
    const minusKey = e.target.closest("[data-cart-minus]")?.dataset.cartMinus;
    if (minusKey) return updateCartQty(minusKey, -1);
    const removeKey = e.target.closest("[data-remove-item]")?.dataset.removeItem;
    if (removeKey) return removeCartItem(removeKey);
  });

  document.getElementById("clearCartBtn").addEventListener("click", () => {
    if (cart.length === 0) return;
    if (confirm("Clear all items from your cart?")) {
      clearCart();
      showToast("Cart cleared.", "success");
    }
  });

  document.getElementById("checkoutBtn").addEventListener("click", openCheckout);

  // ---- Checkout form ----
  document.getElementById("checkoutClose").addEventListener("click", closeCheckout);
  document.getElementById("orderType").addEventListener("change", handleOrderTypeChange);
  document.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
    radio.addEventListener("change", handlePaymentMethodChange);
  });
  document.getElementById("gcashProof").addEventListener("change", (e) => {
    document.getElementById("gcashProofName").textContent = e.target.files[0]?.name || "";
  });
  document.getElementById("mayaProof").addEventListener("change", (e) => {
    document.getElementById("mayaProofName").textContent = e.target.files[0]?.name || "";
  });
  document.getElementById("reviewOrderBtn").addEventListener("click", goToReview);
  document.getElementById("backToCheckoutBtn").addEventListener("click", backToCheckoutForm);
  document.getElementById("paidOrderBtn").addEventListener("click", completePaidOrder);
  document.getElementById("editOrderBtn").addEventListener("click", backToForm);
  document.getElementById("confirmOrderBtn").addEventListener("click", confirmOrder);

  // ---- Confirmation modal ----
  document.getElementById("printOrderBtn").addEventListener("click", () => window.print());
  document.getElementById("saveOrderBtn").addEventListener("click", downloadOrderAsText);
  document.getElementById("continueShoppingBtn").addEventListener("click", () => {
    closeConfirmation();
    scrollToSection("menu");
  });
  document.getElementById("backHomeBtn").addEventListener("click", () => {
    closeConfirmation();
    scrollToSection("home");
  });
  document.getElementById("confirmationClose").addEventListener("click", closeConfirmation);
  document.getElementById("confirmationOverlay").addEventListener("click", (e) => {
    if (e.target.id === "confirmationOverlay") closeConfirmation();
  });

  // ---- Close modals with Escape key ----
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!document.getElementById("productModalOverlay").hidden) closeProductModal();
    if (!document.getElementById("cartDrawer").hidden) closeCart();
    if (!document.getElementById("checkoutOverlay").hidden) closeCheckout();
    if (!document.getElementById("confirmationOverlay").hidden) closeConfirmation();
  });
});
