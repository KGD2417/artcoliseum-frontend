/**
 * Country / state / city option helpers backed by the `country-state-city`
 * dataset. Used to power the cascading address dropdowns. We store human-readable
 * names on the saved address (city/state/country), and ISO codes only in form
 * state to drive the cascade.
 */
import { Country, State, City } from "country-state-city";

export const DEFAULT_COUNTRY_CODE = "IN"; // India

export const countryOptions = () =>
  Country.getAllCountries().map((c) => ({ value: c.isoCode, label: c.name }));

export const stateOptions = (countryCode) =>
  countryCode
    ? State.getStatesOfCountry(countryCode).map((s) => ({ value: s.isoCode, label: s.name }))
    : [];

export const cityOptions = (countryCode, stateCode) =>
  countryCode && stateCode
    ? City.getCitiesOfState(countryCode, stateCode).map((c) => ({ value: c.name, label: c.name }))
    : [];

export const countryNameFromCode = (code) => Country.getCountryByCode(code)?.name || "";

export const countryCodeFromName = (name) =>
  Country.getAllCountries().find((c) => c.name === name)?.isoCode || "";

export const stateCodeFromName = (countryCode, name) =>
  countryCode
    ? State.getStatesOfCountry(countryCode).find((s) => s.name === name)?.isoCode || ""
    : "";
