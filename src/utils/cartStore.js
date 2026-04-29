const KEY = "aureum_cart_v1";

export function getCart() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setCart(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:change"));
}

export function addToCart(item) {
  const cart = getCart();
  if (cart.find((c) => c.id === item.id)) return cart;
  const next = [...cart, item];
  setCart(next);
  return next;
}

export function removeFromCart(id) {
  const next = getCart().filter((c) => c.id !== id);
  setCart(next);
  return next;
}
