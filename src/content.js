import { getStoredTaxRate, parsePrice } from "./taxUtils.js";
import { showTooltip, hideTooltip } from "./tooltip.js";

function normalizeText(text) {
  return (text || "").replace(/\s+/g, " ").trim();
}

function getSelectionContext(range, selectedText) {
  const selected = normalizeText(selectedText);
  const anchor =
    range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;

  if (!anchor || !anchor.textContent) {
    return selected;
  }

  const fullText = normalizeText(anchor.textContent);
  if (!fullText) {
    return selected;
  }

  const index = fullText.toLowerCase().indexOf(selected.toLowerCase());
  if (index < 0) {
    return fullText.slice(0, 300);
  }

  const start = Math.max(0, index - 120);
  const end = Math.min(fullText.length, index + selected.length + 120);
  return fullText.slice(start, end);
}

function isEditableSelection(range) {
  const node =
    range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;

  if (!node || node.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  return Boolean(node.closest("input, textarea, [contenteditable=''], [contenteditable='true'], [role='textbox']"));
}

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

  let range, rect;
  try {
    range = selection.getRangeAt(0);
    rect = range.getBoundingClientRect();
  } catch (e) {
    console.warn("Failed to get range or rect", e);
    hideTooltip();
    return;
  }

  if (isEditableSelection(range)) {
    hideTooltip();
    return;
  }

  const contextText = getSelectionContext(range, text);
  const price = parsePrice(text, contextText);
  if (price === null) {
    hideTooltip();
    return;
  }

  const taxRate = await getStoredTaxRate();
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
