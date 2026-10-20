# Meowdoku

**Meowdoku** is a free cozy **6×6 cat sudoku** game for quick mobile sessions. Soft pastels, gentle affirmations on good moves, streaks and best times saved locally. Built with **Expo (SDK 58)**, **TypeScript**, and **react-native-google-mobile-ads** (Google test units in v1).

> **Naming:** “Meodowku” looks like a typo — existing apps use **Meowdoku** (cat sudoku / cat logic puzzles). This build is classic **number sudoku** with a cozy cat theme, not the separate “one cat per region” logic variant.

## Quick start

```bash
npm install
npx expo start
```

- **Web:** Press `w` in the Expo CLI — full puzzle play works; ads are stubbed (no native AdMob on web).
- **iOS / Android:** Ads require a **development build** (not Expo Go), because `react-native-google-mobile-ads` uses native code:

```bash
npx expo prebuild
npx expo run:ios    # or run:android
```

## Game loop

1. **Menu** — New puzzle, streak / puzzles today / best time, sound mute, bottom banner (native only).
2. **Play** — Tap a cell, pick 1–6 on the pad. Valid placements flash a one-word affirmation. **Hint** (one per puzzle) via rewarded ad reveals a cell.
3. **Complete** — Time, streak stats, banner, optional interstitial (rate-limited), then another puzzle or menu.

## Habit hooks (v1)

| Hook | In-game |
|------|---------|
| **Trigger** | Open app, unfinished grid |
| **Action** | Fill cells, finish rows/boxes |
| **Variable reward** | Rotating affirmations (“Calm”, “Brave”, …) + light haptic / soft feedback |
| **Investment** | Daily streak, puzzles solved today, best time (AsyncStorage) |

See project design note: `docs/meowdoku-hook-loop.md` in Context (Agent Store).

## Ads (v1)

| Placement | Behavior |
|-----------|----------|
| **Banner** | Menu + puzzle complete (not during active grid). |
| **Interstitial** | After puzzle complete if solve time **≥ 12 seconds**, **45s cooldown** between shows. |
| **Rewarded** | One **hint** (reveal cell) per puzzle. |

### Google test IDs (default)

Configured in `app.json` plugin and `src/ads/adUnits.ts`:

| Platform | Test **App** ID |
|----------|-----------------|
| iOS | `ca-app-pub-3940256099942544~1458002511` |
| Android | `ca-app-pub-3940256099942544~3347511713` |

Ad **units** use `TestIds.*` from `react-native-google-mobile-ads` on native.

### Production AdMob setup

1. Create an app in [AdMob](https://admob.google.com/) for iOS and Android.
2. Replace app IDs in `app.json` under the `react-native-google-mobile-ads` plugin.
3. Replace unit IDs in `src/ads/adUnits.ts`.
4. Re-run `npx expo prebuild` and ship new native binaries.

## App Store & privacy notes

- **ATT (iOS):** `NSUserTrackingUsageDescription` is set in `app.json`.
- **Privacy / Data safety:** Declare ad identifiers and usage data per store policies.
- **Kids / COPPA:** General-audience casual game; configure AdMob age tagging if needed.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Expo dev server |
| `npm run android` | Open Android dev client |
| `npm run ios` | Open iOS dev client |
| `npm run web` | Web preview |
| `npm run typecheck` | Typecheck |
