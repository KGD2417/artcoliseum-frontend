import { createContext, useContext, useState, useMemo, useCallback } from "react";

/* Internal price unit is USD. Conversion factors are applied on display. */
const RATES_FROM_USD = {
  USD: 1,
  INR: 83,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 155,
  CNY: 7.2,
};

export const LANGS = {
  EN: { label: "English",   locale: "en-IN", currency: "INR" },
  HI: { label: "हिन्दी",   locale: "hi-IN", currency: "INR" },
  FR: { label: "Français",  locale: "fr-FR", currency: "EUR" },
  ES: { label: "Español",   locale: "es-ES", currency: "EUR" },
  DE: { label: "Deutsch",   locale: "de-DE", currency: "EUR" },
  IT: { label: "Italiano",  locale: "it-IT", currency: "EUR" },
  JP: { label: "日本語",    locale: "ja-JP", currency: "JPY" },
  ZH: { label: "中文",      locale: "zh-CN", currency: "CNY" },
};

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [lang, setLang] = useState("EN");
  const { locale, currency } = LANGS[lang];

  const formatPrice = useCallback((usdAmount, opts = {}) => {
    if (usdAmount == null || usdAmount === "") return "";
    if (typeof usdAmount === "string" && isNaN(Number(usdAmount))) return usdAmount;
    const value = Number(usdAmount) * RATES_FROM_USD[currency];
    const decimals = opts.decimals ?? (currency === "JPY" || currency === "INR" ? 0 : 2);
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
    } catch {
      return `${currency} ${Math.round(value).toLocaleString()}`;
    }
  }, [locale, currency]);

  const value = useMemo(() => ({
    lang, setLang, locale, currency, formatPrice, languages: LANGS,
  }), [lang, locale, currency, formatPrice]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
};
