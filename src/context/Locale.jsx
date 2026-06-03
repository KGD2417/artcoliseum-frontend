import { createContext, useContext, useState, useMemo, useCallback } from "react";

/* Prices are stored and displayed in Indian Rupees (₹), as-is — no FX conversion.
   The language switch only changes UI labels; money always renders in ₹/en-IN. */
export const LANGS = {
  EN: { label: "English",   locale: "en-IN" },
  HI: { label: "हिन्दी",   locale: "hi-IN" },
  FR: { label: "Français",  locale: "fr-FR" },
  ES: { label: "Español",   locale: "es-ES" },
  DE: { label: "Deutsch",   locale: "de-DE" },
  IT: { label: "Italiano",  locale: "it-IT" },
  JP: { label: "日本語",    locale: "ja-JP" },
  ZH: { label: "中文",      locale: "zh-CN" },
};

const MONEY_LOCALE = "en-IN";
const MONEY_CURRENCY = "INR";

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [lang, setLang] = useState("EN");
  const { locale } = LANGS[lang];

  // Format a raw rupee amount as ₹. The number is taken at face value.
  const formatPrice = useCallback((amount, opts = {}) => {
    if (amount == null || amount === "") return "";
    if (typeof amount === "string" && isNaN(Number(amount))) return amount;
    const value = Number(amount);
    const decimals = opts.decimals ?? 0;
    try {
      return new Intl.NumberFormat(MONEY_LOCALE, {
        style: "currency",
        currency: MONEY_CURRENCY,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
    } catch {
      return `₹${Math.round(value).toLocaleString("en-IN")}`;
    }
  }, []);

  const value = useMemo(() => ({
    lang, setLang, locale, currency: MONEY_CURRENCY, formatPrice, languages: LANGS,
  }), [lang, locale, formatPrice]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
};
