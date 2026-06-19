// Length-unit conversion. cm is the canonical / legal unit everywhere; the UI may
// offer inches and feet, converting on the fly. Matches the backend factors in
// app/utils/pricing.py (_TO_CM) so prices and dimensions stay consistent.

export const UNIT_TO_CM = { cm: 1, inch: 2.54, inches: 2.54, in: 2.54, feet: 30.48, foot: 30.48, ft: 30.48 };

// Short display suffix for a unit.
export const unitLabel = (unit) =>
  unit === "inch" || unit === "inches" || unit === "in" ? "in"
    : unit === "feet" || unit === "foot" || unit === "ft" ? "ft"
      : "cm";

const _factor = (unit) => UNIT_TO_CM[(unit || "cm").toLowerCase()] ?? 1;
const _round = (n) => Math.round(n * 100) / 100; // 2 dp is plenty for artwork sizes

/** Convert a value in `unit` to centimetres. Returns null for blanks. */
export function toCm(value, unit) {
  if (value === "" || value == null) return null;
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  return _round(n * _factor(unit));
}

/** Convert a centimetre value into `unit`. Returns null for blanks. */
export function fromCm(cm, unit) {
  if (cm === "" || cm == null) return null;
  const n = Number(cm);
  if (Number.isNaN(n)) return null;
  return _round(n / _factor(unit));
}

/** Build a "25.4 × 30.48 cm" string from centimetre numbers, expressed in `unit`. */
export function formatDimsFromCm(cmW, cmH, cmD, unit = "cm") {
  const parts = [cmW, cmH, cmD]
    .filter((x) => x != null && x !== "" && !Number.isNaN(Number(x)))
    .map((x) => fromCm(x, unit));
  if (parts.length < 2) return "";
  return `${parts.join(" × ")} ${unitLabel(unit)}`;
}

/** Parse a dims string ("10 × 12 inch" / "40 x 40 x 60 cm") → numbers + source unit + cm. */
export function parseDims(str) {
  if (!str || typeof str !== "string") return null;
  const nums = (str.match(/[\d.]+/g) || []).map(Number).filter((n) => !Number.isNaN(n));
  if (nums.length < 2) return null;
  const lower = str.toLowerCase();
  const unit = /inch|\bin\b|"/.test(lower) ? "inch"
    : /feet|foot|\bft\b|'/.test(lower) ? "feet"
      : "cm";
  return { nums, unit, cm: nums.map((n) => toCm(n, unit)) };
}

/** Re-express a dimensions string into `targetUnit` (cm/inch/feet). */
export function convertDimsString(str, targetUnit = "cm") {
  const p = parseDims(str);
  if (!p) return str || "";
  const [w, h, d] = p.cm;
  return formatDimsFromCm(w, h, d, targetUnit) || str;
}

/** Format raw dimension numbers given in `srcUnit` as a cm string (for legal docs). */
export function dimsToCm(values, srcUnit) {
  const cm = (values || [])
    .filter((x) => x != null && x !== "" && !Number.isNaN(Number(x)))
    .map((x) => toCm(x, srcUnit));
  if (cm.length < 2) return "";
  return `${cm.join(" × ")} cm`;
}
