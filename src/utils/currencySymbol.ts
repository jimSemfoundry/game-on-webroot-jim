import getSymbolFromCurrencyBase from "currency-symbol-map";

const customSymbolMap: Record<string, string> = {
  MXN: "MX$",
  PKR: "₨",
  EGP: "£E",
  CLP: "CLP$",
  NGN: "₦",
  ARS: "AR$",
  AUD: "AU$",
  CAD: "CA$",
  HKD: "HK$",
  NZD: "NZ$",
  KES: "KSh",
  XAF: "XAF",
  COP: "COL$",
  IRR: "﷼",
  QAR: "QR",
  GHS: "₵",
  XOF: "XOF"
};

const getSymbolFromCurrency = (currencyCode?: string): string | undefined => {
  if (!currencyCode) return undefined;
  const code = currencyCode.trim().toUpperCase();
  if (!code) return undefined;
  return customSymbolMap[code] ?? getSymbolFromCurrencyBase(code);
};

export default getSymbolFromCurrency;
export { customSymbolMap };
