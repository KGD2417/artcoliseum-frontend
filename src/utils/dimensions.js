// Shared helpers for an artwork's physical size.

// A category is 3-D (gets a depth / length dimension) when its slug or label
// reads like a sculpture or other three-dimensional form.
export function isThreeD(categoryId, cats = []) {
  const c = cats.find((x) => x.id === categoryId);
  return /sculpt|3d|statue|instal|ceramic|wood|metal|stone/.test(
    `${categoryId} ${c?.label || ""}`.toLowerCase(),
  );
}

// Compose a display dimensions string ("90 × 60 cm" / "40 × 80 × 30 cm") from
// structured numbers. Returns "" when fewer than two dimensions are present.
export function composeDims(w, h, d, unit) {
  const parts = [w, h, d].filter((x) => x !== "" && x != null && !Number.isNaN(Number(x)));
  if (parts.length < 2) return "";
  return `${parts.join(" × ")} ${unit || "cm"}`;
}
