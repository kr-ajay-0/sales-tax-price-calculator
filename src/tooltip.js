export function createTooltip() {
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
  }
  return tooltip;
}

export function showTooltip(x, y, text) {
  const tooltip = createTooltip();
  tooltip.textContent = text;
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
  tooltip.style.opacity = 1;
}

export function hideTooltip() {
  const tooltip = document.getElementById("tax-tooltip");
  if (tooltip) {
    tooltip.style.opacity = 0;
  }
}
