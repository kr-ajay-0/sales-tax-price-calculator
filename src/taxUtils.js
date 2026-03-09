const CURRENCY_SYMBOL_RE = /[$\u00A3\u00A5\u20AC\u20B9]/;
const CURRENCY_CODE_RE = /\b(?:USD|CAD|EUR|GBP|JPY|INR|AUD|NZD|CHF)\b/i;
const PRICE_KEYWORD_RE =
  /\b(?:price|total|amount|cost|subtotal|checkout|cart|sale|deal|discount|pay|payment|paid|due|from|now|was|only|each|per|msrp|list\s+price|starting\s+at)\b/i;
const STRONG_PRICE_KEYWORD_RE = /\b(?:price|total|amount|cost|subtotal|due)\b/i;
const NON_PRICE_KEYWORD_RE =
  /\b(?:phone|tel|mobile|fax|call|item(?:\s*no\.?)?|order(?:\s*no\.?)?|invoice|tracking|shipment|id|sku|serial|reference|ref|ticket|account|zip|postal|pin|ssn|model|part)\b/i;

function normalizeText(text) {
  return (text || "").replace(/\s+/g, " ").trim();
}

function looksLikePhoneNumber(text) {
  const trimmed = normalizeText(text).replace(/\b(?:ext|x)\s*\d+$/i, "").trim();
  const digits = trimmed.replace(/\D/g, "");

  if (digits.length < 9 || digits.length > 13) {
    return false;
  }

  if (CURRENCY_SYMBOL_RE.test(trimmed) || CURRENCY_CODE_RE.test(trimmed)) {
    return false;
  }

  return /[\s().-]/.test(trimmed) || /^\+?\d+$/.test(trimmed);
}

function looksLikeIdentifier(text) {
  const trimmed = normalizeText(text);
  if (!trimmed) {
    return false;
  }

  // Common ID patterns like A12B-90, #123456, INV-1234, etc.
  return (
    /[A-Za-z]/.test(trimmed) &&
    /\d/.test(trimmed) &&
    !CURRENCY_CODE_RE.test(trimmed)
  );
}

export function parsePrice(text, contextText = "") {
  const raw = normalizeText(text);
  const context = normalizeText(contextText);

  if (!raw || /%/.test(raw)) {
    return null;
  }

  const combinedContext = `${context} ${raw}`;
  const hasCurrencySignal =
    CURRENCY_SYMBOL_RE.test(combinedContext) || CURRENCY_CODE_RE.test(combinedContext);
  const hasPriceKeyword = PRICE_KEYWORD_RE.test(combinedContext);

  // Require an actual price signal (currency marker or nearby pricing language).
  if (!hasCurrencySignal && !hasPriceKeyword) {
    return null;
  }

  if (looksLikePhoneNumber(raw) || looksLikeIdentifier(raw)) {
    return null;
  }

  // If surrounding text looks like IDs/orders and there is no strong pricing word,
  // treat it as non-price.
  if (
    NON_PRICE_KEYWORD_RE.test(combinedContext) &&
    !hasCurrencySignal &&
    !STRONG_PRICE_KEYWORD_RE.test(combinedContext)
  ) {
    return null;
  }

  // Reject date/range-like text unless a currency marker is present.
  if (!hasCurrencySignal && /\d+\s*[-/]\s*\d+/.test(raw)) {
    return null;
  }

  // Prices with more than 2 decimals are usually not real prices in this use case.
  if (/\.\d{3,}/.test(raw)) {
    return null;
  }

  const numberMatches = raw.match(/(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?/g);
  if (!numberMatches || numberMatches.length === 0) {
    return null;
  }

  // Multiple numeric chunks without currency marker are commonly phones/IDs.
  if (numberMatches.length > 1 && !hasCurrencySignal) {
    return null;
  }

  let amountToken = numberMatches[0];
  if (numberMatches.length > 1 && hasCurrencySignal) {
    const currencyAmountMatch = raw.match(
      /(?:[$\u00A3\u00A5\u20AC\u20B9]\s*|(?:USD|CAD|EUR|GBP|JPY|INR|AUD|NZD|CHF)\s*)((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?)/i
    );
    if (currencyAmountMatch) {
      amountToken = currencyAmountMatch[1];
    }
  }

  const normalizedAmount = amountToken.replace(/,/g, "");
  const value = Number.parseFloat(normalizedAmount);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  const integerDigits = normalizedAmount.split(".")[0].replace(/^0+/, "").length;
  if (integerDigits > 7 && !hasCurrencySignal) {
    return null;
  }

  // Reject bare bullet/list numbers like "1." or "2)" unless price context exists.
  if (/^[\-*\u2022]?\s*\d+[.)]?$/.test(raw) && !hasCurrencySignal && !hasPriceKeyword) {
    return null;
  }

  return value;
}

export const taxRates = {
  Canada: {
    AB: 5, BC: 12, MB: 12, NB: 15, NL: 15, NT: 5, NS: 14, NU: 5,
    ON: 13, PE: 15, QC: 14.975, SK: 11, YT: 5
  },
  US: {
    AL: 4, AK: 0, AZ: 5.6, AR: 6.5, CA: 7.25, CO: 2.9,
    CT: 6.35, DE: 0, FL: 6, GA: 4, HI: 4, ID: 6,
    IL: 6.25, IN: 7, IA: 6, KS: 6.5, KY: 6, LA: 4.45,
    ME: 5.5, MD: 6, MA: 6.25, MI: 6, MN: 6.875,
    MS: 7, MO: 4.225, MT: 0, NE: 5.5, NV: 6.85,
    NH: 0, NJ: 6.625, NM: 5.125, NY: 4, NC: 4.75,
    ND: 5, OH: 5.75, OK: 4.5, OR: 0, PA: 6,
    RI: 7, SC: 6, SD: 4.2, TN: 7, TX: 6.25,
    UT: 4.85, VT: 6, VA: 5.3, WA: 6.5, WV: 6,
    WI: 5, WY: 4
  }
};

export async function getStoredTaxRate() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["country", "region", "customRate"], (data) => {
      if (!data.country) {
        return resolve(null);
      }

      if (data.country === "Custom") {
        const rate = parseFloat(data.customRate);
        return resolve(isNaN(rate) ? null : rate / 100);
      }

      if (data.country === "Canada" || data.country === "US") {
        const regionRate = taxRates[data.country][data.region];
        if (regionRate == null) {
          return resolve(null);
        }
        return resolve(regionRate / 100);
      }

      resolve(null);
    });
  });
}
