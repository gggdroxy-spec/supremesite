const { loadCart, saveCart, findProduct, cartSubtotal, orderTotal, formatMoney } = SupremeStore;

let cart = loadCart();

const els = {
  empty: document.getElementById("checkoutEmpty"),
  success: document.getElementById("checkoutSuccess"),
  layout: document.getElementById("checkoutLayout"),
  title: document.getElementById("checkoutTitle"),
  form: document.getElementById("checkoutForm"),
  summaryLines: document.getElementById("summaryLines"),
  sumSubtotal: document.getElementById("sumSubtotal"),
  sumTotal: document.getElementById("sumTotal"),
  payAmount: document.getElementById("payAmount"),
  orderNumber: document.getElementById("orderNumber"),
  successEmail: document.getElementById("successEmail"),
};

function renderSummary() {
  const sub = cartSubtotal(cart);
  const total = orderTotal(cart);

  els.sumSubtotal.textContent = formatMoney(sub);
  els.sumTotal.textContent = formatMoney(total);
  els.payAmount.textContent = formatMoney(total);

  els.summaryLines.innerHTML = cart
    .map((line) => {
      const p = findProduct(line.id);
      if (!p) return "";
      return `
        <li class="checkout-line">
          <img src="${p.image}" alt="" width="56" height="56" />
          <div>
            <strong>${p.name}</strong>
            <span class="meta">Digital license · Qty ${line.qty}</span>
          </div>
          <span>${formatMoney(p.price * line.qty)}</span>
        </li>
      `;
    })
    .join("");
}

function showEmpty() {
  els.empty.hidden = false;
  els.layout.hidden = true;
  els.title.hidden = true;
}

function init() {
  cart = loadCart().filter((line) => findProduct(line.id));
  if (!cart.length) {
    showEmpty();
    return;
  }
  renderSummary();
}

els.form?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!cart.length) {
    showEmpty();
    return;
  }
  if (!els.form.reportValidity()) return;

  const email = els.form.email.value.trim();
  const orderId = `SP-${Date.now().toString(36).toUpperCase()}`;

  cart = [];
  saveCart(cart);

  els.layout.hidden = true;
  els.title.hidden = true;
  els.success.hidden = false;
  els.orderNumber.textContent = orderId;
  els.successEmail.textContent = `Confirmation will be sent to ${email} (demo).`;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

function initPaymentMethod() {
  const methods = document.querySelectorAll(".pay-method");
  const panelWrap = document.querySelector(".pay-panels");
  const panelCards = document.getElementById("payPanelCards");
  const panelCrypto = document.getElementById("payPanelCrypto");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const swapMs = reduceMotion ? 0 : 450;

  function setMethod(value, animate = true) {
    const isCards = value === "cards";
    methods.forEach((m) => {
      const radio = m.querySelector('input[name="payMethod"]');
      m.classList.toggle("is-selected", radio.value === value);
    });

    const next = isCards ? panelCards : panelCrypto;
    const prev = next === panelCards ? panelCrypto : panelCards;

    if (next.classList.contains("is-active")) return;

    if (!animate || reduceMotion) {
      panelCards.classList.toggle("is-active", isCards);
      panelCrypto.classList.toggle("is-active", !isCards);
      panelCards.classList.remove("is-leaving");
      panelCrypto.classList.remove("is-leaving");
      panelWrap?.classList.remove("is-swapping");
      return;
    }

    panelWrap?.classList.add("is-swapping");
    prev.classList.add("is-leaving");
    prev.classList.remove("is-active");
    next.classList.add("is-active");

    window.setTimeout(() => {
      prev.classList.remove("is-leaving");
      panelWrap?.classList.remove("is-swapping");
    }, swapMs);
  }

  methods.forEach((label) => {
    const radio = label.querySelector('input[name="payMethod"]');
    radio.addEventListener("change", () => {
      if (radio.checked) setMethod(radio.value);
    });
    label.addEventListener("mousedown", (e) => {
      e.preventDefault();
    });
    label.addEventListener("click", () => {
      radio.checked = true;
      setMethod(radio.value);
      window.getSelection()?.removeAllRanges();
    });
  });

  const checked = document.querySelector('input[name="payMethod"]:checked');
  setMethod(checked ? checked.value : "cards", false);
}

if (document.querySelector(".pay-method")) {
  initPaymentMethod();
}
init();

(function preventCopy() {
  const allow = /^(INPUT|TEXTAREA|SELECT)$/;
  function blocked(t) {
    if (!t) return true;
    if (allow.test(t.nodeName)) return false;
    if (t.closest && t.closest('[contenteditable="true"]')) return false;
    return true;
  }
  document.addEventListener("copy", (e) => {
    if (blocked(e.target)) e.preventDefault();
  });
  document.addEventListener("cut", (e) => {
    if (blocked(e.target)) e.preventDefault();
  });
  document.addEventListener("contextmenu", (e) => {
    if (blocked(e.target)) e.preventDefault();
  });
  document.addEventListener("selectstart", (e) => {
    if (blocked(e.target)) e.preventDefault();
  });
  document.addEventListener("dragstart", (e) => {
    if (e.target && e.target.tagName === "IMG") e.preventDefault();
  });
})();
