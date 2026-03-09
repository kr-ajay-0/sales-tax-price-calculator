# Chrome Web Store Publishing Checklist

## 0. Account prerequisites
1. Register a Chrome Web Store developer account and complete the one-time registration fee.
2. Ensure 2-step verification is enabled on your Google account.
3. Decide your public support URL and privacy policy URL.

## 1. Pre-flight checks
1. Update extension version in `manifest.json` (and `package.json` if you keep them aligned).
2. Run build:
   - `npm run build`
3. Create release ZIP:
   - `npm run package:chrome`
4. Verify the ZIP in `release/` contains only:
   - `manifest.json`
   - `dist/`
   - `icons/`
   - `popup.html`, `popup.js`, `popup.css`
   - optional docs (`README.md`, `PRIVACY.md`)

## 2. Test before upload
1. Open `chrome://extensions`.
2. Remove old unpacked copy (optional but recommended).
3. Load the project folder with **Load unpacked**.
4. Verify:
   - Extension icon appears.
   - Popup saves settings.
   - Selecting real prices shows tooltip.
   - Phone/order/id numbers are ignored.
5. Check `chrome://extensions` -> your extension -> **Errors** is empty.

## 3. Prepare store assets
1. Short description (up to 132 chars).
2. Detailed description.
3. At least one screenshot (1280x800 or 640x400), up to 5.
4. Small promo tile image (440x280).
5. Store icon (128x128).
6. Privacy policy URL (host your `PRIVACY.md` somewhere public).

## 4. Publish
1. Open Chrome Web Store Developer Dashboard.
2. Create new item.
3. Upload `release/sales-tax-price-calculator-vX.Y.Z.zip`.
4. Fill Store Listing, Privacy, and Distribution tabs.
5. In Privacy tab, declare single purpose and data handling accurately.
6. Add test instructions if reviewer needs setup context.
7. Submit for review.

## 5. After approval
1. Install from the live store listing.
2. Validate in a clean Chrome profile.
3. Tag release in GitHub with matching version.
