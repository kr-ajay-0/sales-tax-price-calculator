export function parsePrice(text) {
  const cleaned = text.replace(/[^0-9.]/g, "");
  const value = parseFloat(cleaned);
  console.log(`Parsed value from "${text}" is ${value}`);
  return isNaN(value) ? null : value;
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
      console.log("Storage get result:", data);
      if (!data.country) {
        return resolve(null);
      }

      if (data.country === "Custom") {
        const rate = parseFloat(data.customRate);
        console.log("Custom tax rate:", rate);
        return resolve(isNaN(rate) ? null : rate / 100);
      }

      if (data.country === "Canada" || data.country === "US") {
        const regionRate = taxRates[data.country][data.region];
        console.log(`Loaded tax settings data:`, data);
        if (regionRate == null) {
          console.warn("No tax rate set for country/region without fallback");
          return resolve(null);
        }
        console.log(`Resolved tax rate for ${data.country}-${data.region}: ${regionRate}`);
        return resolve(regionRate / 100);
      }

      resolve(null);
    });
  });
}
