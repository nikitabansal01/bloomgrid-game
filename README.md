# NeonSlice

**NeonSlice** is a free casual stack-timing game: a neon block slides left and right — tap to slice it onto the tower. Overlap shrinks each layer; miss the stack and the run ends. Built with **Expo (SDK 58)**, **TypeScript**, and **react-native-google-mobile-ads** (Google test units in v1).

## Quick start

```bash
npm install
npx expo start
```

- **Web:** Press `w` in the Expo CLI — full gameplay works; ads are stubbed (no native AdMob on web).
- **iOS / Android:** Ads require a **development build** (not Expo Go), because `react-native-google-mobile-ads` uses native code:

```bash
npx expo prebuild
npx expo run:ios    # or run:android
```

## Game loop

1. **Menu** — Play, personal best, bottom banner (native only).
2. **Play** — Tap to place the moving slice; perfect alignments build combo score.
3. **Game over** — Score, best, screenshot-friendly share line, optional **rewarded continue once per run**, then **Try again**.

## Ads (v1)

| Placement | Behavior |
|-----------|----------|
| **Banner** | Menu + game over only (not during active play). |
| **Interstitial** | After game over if the run lasted **≥ 30 seconds**, with **45s cooldown** between shows. |
| **Rewarded** | “Watch ad · Continue once” removes the top miss and resumes (once per run). |

### Google test IDs (default)

Configured in `app.json` plugin and `src/ads/adUnits.ts`:

| Platform | Test **App** ID |
|----------|-----------------|
| iOS | `ca-app-pub-3940256099942544~1458002511` |
| Android | `ca-app-pub-3940256099942544~3347511713` |

Ad **units** use `TestIds.*` from `react-native-google-mobile-ads` on native (Banner / Interstitial / Rewarded sample units from [Google’s test ad docs](https://developers.google.com/admob/ios/test-ads)).

### Production AdMob setup

1. Create an app in [AdMob](https://admob.google.com/) for iOS and Android.
2. Replace app IDs in `app.json` under the `react-native-google-mobile-ads` plugin (`iosAppId`, `androidAppId`).
3. Replace unit IDs in `src/ads/adUnits.ts` (swap `TestIds` for your real unit strings).
4. Re-run `npx expo prebuild` and ship new native binaries.

## App Store & privacy notes

- **ATT (iOS):** `NSUserTrackingUsageDescription` is set in `app.json`. Request tracking when you enable personalized ads (e.g. via `expo-tracking-transparency` before loading ads).
- **Privacy Nutrition Labels / Data safety:** Declare ad identifiers, diagnostics, and usage data per [Apple App Privacy](https://developer.apple.com/app-store/app-privacy-details/) and [Google Play Data safety](https://support.google.com/googleplay/android-developer/answer/10787469).
- **Privacy manifest (iOS):** After `expo prebuild`, review the generated `PrivacyInfo.xcprivacy` and add required-reason APIs if you add more SDKs.
- **Kids / COPPA:** This build is a general-audience casual game; configure ad tagging and age gates in AdMob if you target children.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Expo dev server |
| `npm run android` | Open Android dev client |
| `npm run ios` | Open iOS dev client |
| `npm run web` | Web preview |
| `npx tsc --noEmit` | Typecheck |

## Share-friendly scores

Game over shows a single line meant for screenshots, e.g.:

`NeonSlice — 12 layers · 5 perfect · score 18 · best 24 🌈`

Designed for organic sharing loops (see project research on score bragging and spoiler-free share artifacts).
