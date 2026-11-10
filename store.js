const SupremeStore = (() => {
  const PRODUCTS = [
    {
      id: "plan-1m",
      name: "Public bypass — 1 Month",
      price: 39.99,
      image: "supreme.png",
    },
    {
      id: "plan-3m",
      name: "Public bypass — 3 Months",
      price: 59.99,
      image: "supreme.png",
    },
    {
      id: "plan-life",
      name: "Public bypass — Lifetime",
      price: 99.99,
      image: "supreme.png",
    },
    {
      id: "plan-custom",
      name: "Custom bypass",
      price: 179.99,
      image: "supreme.png",
    },
  ];

  const CART_KEY = "supreme-cart";

  const money = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
  const formatMoney = (n) => money.format(n);

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function findProduct(id) {
    return PRODUCTS.find((p) => p.id === id);
  }

  function cartSubtotal(cart) {
    return cart.reduce((sum, line) => {
      const p = findProduct(line.id);
      return sum + (p ? p.price * line.qty : 0);
    }, 0);
  }

  function orderTotal(cart) {
    return cartSubtotal(cart);
  }

  return {
    PRODUCTS,
    CART_KEY,
    formatMoney,
    loadCart,
    saveCart,
    findProduct,
    cartSubtotal,
    orderTotal,
  };
})();
