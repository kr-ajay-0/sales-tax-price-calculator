import { getStoredTaxRate, parsePrice } from "./taxUtils.js";
import { showTooltip, hideTooltip } from "./tooltip.js";

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
