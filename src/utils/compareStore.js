// Tiny client-side "compare" list (artwork ids), persisted in localStorage.
// Mirrors cartStore: emits a "compare:change" event so any view can re-read.
const KEY = "coli_compare_v1";
export const MAX_COMPARE = 4;

export function getCompare() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(ids) {
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("compare:change"));
  return ids;
}

export function isCompared(id) {
  return getCompare().includes(id);
}

/** Add/remove an id; returns the new list. Caps at MAX_COMPARE. */
export function toggleCompare(id) {
  const cur = getCompare();
  if (cur.includes(id)) return save(cur.filter((x) => x !== id));
  if (cur.length >= MAX_COMPARE) return cur; // silently ignore past the cap
  return save([...cur, id]);
}

export function removeCompare(id) {
  return save(getCompare().filter((x) => x !== id));
}

export function clearCompare() {
  return save([]);
}

/** Subscribe to changes; returns an unsubscribe fn. */
export function onCompareChange(cb) {
  window.addEventListener("compare:change", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("compare:change", cb);
    window.removeEventListener("storage", cb);
  };
}
