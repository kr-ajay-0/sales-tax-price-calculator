(() => {
  // src/taxUtils.js
  function parsePrice(text) {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const value = parseFloat(cleaned);
    console.log(`Parsed value from "${text}" is ${value}`);
    return isNaN(value) ? null : value;
  }
  var taxRates = {
    Canada: {
      AB: 5,
      BC: 12,
      MB: 12,
      NB: 15,
      NL: 15,
      NT: 5,
      NS: 14,
      NU: 5,
      ON: 13,
      PE: 15,
      QC: 14.975,
      SK: 11,
      YT: 5
    },
    US: {
      AL: 4,
      AK: 0,
      AZ: 5.6,
      AR: 6.5,
      CA: 7.25,
      CO: 2.9,
      CT: 6.35,
      DE: 0,
      FL: 6,
      GA: 4,
      HI: 4,
      ID: 6,
      IL: 6.25,
      IN: 7,
      IA: 6,
      KS: 6.5,
      KY: 6,
      LA: 4.45,
      ME: 5.5,
      MD: 6,
      MA: 6.25,
      MI: 6,
      MN: 6.875,
      MS: 7,
      MO: 4.225,
      MT: 0,
      NE: 5.5,
      NV: 6.85,
      NH: 0,
      NJ: 6.625,
      NM: 5.125,
      NY: 4,
      NC: 4.75,
      ND: 5,
      OH: 5.75,
      OK: 4.5,
      OR: 0,
      PA: 6,
      RI: 7,
      SC: 6,
      SD: 4.2,
      TN: 7,
      TX: 6.25,
      UT: 4.85,
      VT: 6,
      VA: 5.3,
      WA: 6.5,
      WV: 6,
      WI: 5,
      WY: 4
    }
  };
  async function getStoredTaxRate() {
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

  // src/tooltip.js
  function createTooltip() {
    let tooltip = document.getElementById("tax-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.id = "tax-tooltip";
      tooltip.style = `
      position: absolute;
      background: #333;
      color: #fff;
      padding: 5px 8px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 9999;
      pointer-events: none;
      transition: opacity 0.2s;
      opacity: 0;
    `;
      document.body.appendChild(tooltip);
      console.log("Tooltip created and added to document.");
    }
    return tooltip;
  }
  function showTooltip(x, y, text) {
    const tooltip = createTooltip();
    tooltip.textContent = text;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.style.opacity = 1;
    console.log(`Tooltip positioned at (${x}, ${y}) with text: "${text}"`);
  }
  function hideTooltip() {
    const tooltip = document.getElementById("tax-tooltip");
    if (tooltip) {
      tooltip.style.opacity = 0;
      console.log("Tooltip hidden");
    }
  }

  // src/content.js
  document.addEventListener("mouseup", async () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      hideTooltip();
      return;
    }
    let text = selection.toString().trim();
    if (!text) {
      hideTooltip();
      return;
    }
    const price = parsePrice(text);
    if (price === null) {
      hideTooltip();
      return;
    }
    const taxRate = await getStoredTaxRate();
    let range, rect;
    try {
      range = selection.getRangeAt(0);
      rect = range.getBoundingClientRect();
    } catch (e) {
      console.warn("Failed to get range or rect", e);
      hideTooltip();
      return;
    }
    const x = rect.left + window.scrollX + rect.width / 2;
    const y = rect.bottom + window.scrollY + 5;
    if (taxRate === null) {
      showTooltip(x, y, "Please set tax settings first");
      return;
    }
    const afterTax = (price * (1 + taxRate)).toFixed(2);
    showTooltip(x, y, `After tax: $${afterTax}`);
  });
  document.addEventListener("mousedown", () => {
    hideTooltip();
  });
  document.addEventListener("mousedown", () => {
    console.log("Mouse down - hiding tooltip");
    hideTooltip();
  });
})();
