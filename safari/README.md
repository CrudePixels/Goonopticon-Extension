# Safari (macOS)

Goonopticon is a Manifest V3 web extension. Safari loads the same `manifest.json` and bundled assets as Chrome/Edge/Firefox.

## Quick test (no Xcode)

1. Run `npm run build` in the repo root.
2. On Mac, open **Safari → Settings → Developer**.
3. Enable **Allow unsigned extensions** (resets when Safari quits).
4. Click **Add Temporary Extension…** and choose this **repository root** (folder that contains `manifest.json`).

Temporary extensions last until Safari restarts or ~24 hours. See [Running your Safari web extension](https://developer.apple.com/documentation/safariservices/running-your-safari-web-extension).

## Xcode wrapper (iOS testing & App Store)

On **macOS** with **Xcode** installed:

```bash
npm run build
npm run safari:convert
```

This runs `xcrun safari-web-extension-converter` and writes `safari/GoonopticonApp/` (gitignored). Open the generated `.xcodeproj`, run the **macOS** target, then enable the extension in Safari → Settings → Extensions.

App Store distribution requires the [Apple Developer Program](https://developer.apple.com/programs/).

## Notes

- `browser_specific_settings.safari` in `manifest.json` sets `strict_min_version` **16.4** (adjust if you need older Safari).
- Some APIs differ on iOS; the sidebar targets **youtube.com** and should work in Safari on iPhone/iPad once wrapped in an iOS app target from Xcode.
