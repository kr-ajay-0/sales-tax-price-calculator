# Sales Tax Price Calculator

Chrome extension that shows after-tax shopping price when you select price text on a webpage. Not for tax filing or tax returns.

## Install (Developer Mode)
1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select this project folder.

## How To Use
1. Click the extension icon.
2. Choose **Canada**, **US**, or **Custom** tax rate.
3. Click **Save Settings**.
4. On a webpage, highlight a price (example: `$19.99`, `USD 49`, `Total: 25.00`).
5. A tooltip will show the after-tax value.

## What Is Ignored
- Phone numbers
- Order/item/invoice IDs
- List or bullet numbers
- Percent values

## Troubleshooting
- If changes do not apply, go to `chrome://extensions` and click **Reload**.
- If icon does not appear, pin the extension from Chrome's extensions menu.

## Build And Package
- Build extension bundle:
  - `npm run build`
- Create Chrome Web Store ZIP:
  - `npm run package:chrome`
- Output ZIP:
  - `release/sales-tax-price-calculator-v<manifest-version>.zip`

## Publishing
- Follow the ordered checklist in `PUBLISHING.md`.
- Privacy policy text is in `PRIVACY.md`.

## Donation Buttons
- Open `popup.js`.
- Update `DONATION_LINKS.paypal` with your PayPal link (for example `https://www.paypal.me/yourname` or PayPal donate URL).
- Optional: update `DONATION_LINKS.buyMeACoffee` with your Buy Me a Coffee page URL.
