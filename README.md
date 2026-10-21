# BloomGrid

Soft **6×6 placement logic puzzle** (Queens-style: one 🩸 token per row, column, and colored region; tokens never touch, even diagonally) with cycle-positive copy, gentle SFX, affirmation celebrations, daily puzzle streaks, and optional mood emoji (stored on-device only). Built with **Expo SDK 58** (52+) for **iOS App Store** and **Google Play**.

**Brand:** BloomGrid uses abstract cycle visuals (ring, phases, crescent) — **no cat characters or mascots**. Cozy cat puzzles live in a separate Meowdoku-style product; this app stays menstrual-cycle / wellness themed only.

> **Not medical advice.** BloomGrid is a puzzle game, not a medical device or period tracker. It does not diagnose, treat, or predict your cycle. See in-app disclaimer and [Health & privacy](#health--privacy) below.

Product vision (Project Context): `docs/period-puzzle-game-vision.md` in the Game Design project store.

## Quick start (development)

```bash
npm install
npm run generate-assets   # icons, splash, SFX
npx expo start
```

- **iOS / Android:** use a [development build](#native-builds--ads) (required for AdMob). Expo Go will run the puzzle, but Google Mobile Ads need native modules.
- **Web (optional):** `npx expo start --web` — puzzle works; ads are stubbed only.
- **Tests:** `npm test` (puzzle rules, solver uniqueness) and `npm run typecheck`.

### Puzzle

Each daily board is generated from the date: a random non-touching token layout, regions grown around each token, then regions are adjusted until the solver (`src/game/queens.ts`) finds exactly one solution. Tap a cell to cycle empty → ✕ → token → empty (long-press toggles the token). The token emoji is the single constant `THEME_TOKEN` in `src/theme/colors.ts`.

## Native builds & ads

AdMob (`react-native-google-mobile-ads`) uses **Google test app IDs** in `app.config.ts`. Replace with your production IDs before release.

### One-time EAS setup

```bash
npm install -g eas-cli
eas login
eas init   # links project; replaces placeholder projectId in app.config.ts extra.eas
```

### Build profiles (`eas.json`)

| Profile       | Use |
|---------------|-----|
| `development` | Dev client, internal, iOS simulator + Android APK |
| `preview`     | Internal QA APK / device builds |
| `production`  | Store release (`autoIncrement` for version/build) |

```bash
eas build --platform all --profile development
eas build --platform all --profile preview
eas build --platform all --profile production
```

Submit after production builds:

```bash
eas submit --platform ios
eas submit --platform android
```

### Verify prebuild (CI-friendly)

```bash
npx expo prebuild --no-install --platform android
npx expo prebuild --no-install --platform ios
```

Verified in this repo’s CI/dev flow; generates `android/` and `ios/` native projects with the AdMob config plugin applied.

### Production AdMob checklist

1. Create AdMob app + ad units (banner, interstitial).
2. Update `app.config.ts` plugin `androidAppId` / `iosAppId` and `src/ads/adUnits.ts` unit IDs (remove `TestIds`).
3. **iOS:** App Tracking Transparency — `NSUserTrackingUsageDescription` is set; present ATT when you integrate UMP/consent (recommended before personalized ads).
4. **iOS:** Privacy manifest placeholders live under `ios.privacyManifests` in `app.config.ts` — review with legal before App Store submission.
5. **Google Play:** declare **contains ads**; complete the **Ads declaration** and **Data safety** form (device IDs for advertising, optional analytics if added later).
6. **SKAdNetwork:** the Google Mobile Ads config plugin adds required identifiers; re-run prebuild after plugin upgrades.

### Ad placement (v1)

- **Banner:** home screen only (`MenuBanner`).
- **Interstitial:** after puzzle win if session ≥ 45s, 60s cooldown — never on the grid.
- **No ads** during active play.

## Sound assets

Short tones are **procedurally generated** (sine waves, no third-party audio):

```bash
node scripts/generate-sounds.mjs
```

Output: `assets/sounds/*.wav` — documented in `scripts/generate-sounds.mjs`.

## Tone guidelines (content)

- Gentle, affirming, destigmatizing — never clinical or shame-y.
- Cycle references are normalize-and-rest, not medical claims.
- Win words: Rest, Flow, Brave, Enough, Gentle, Strong, Valid, Breathe.
- Palette: cream, blush, lavender, sage (see `src/theme/colors.ts`).

## Health & privacy

- Mood emoji after wins: **AsyncStorage only**, not uploaded.
- Streak + daily seed: local only.
- Disclaimer shown on home; full text in `src/components/HealthDisclaimer.tsx`.
- Replace placeholder bundle ID `com.bloomgrid.app` with your final ID before store listing.

## v2 backlog

- Push notification opt-in + daily reminder copy
- 9×9 classic mode, difficulty levels
- Ambient audio toggle
- UMP/consent flow + ATT prompt timing
- Cycle-phase flavor copy (non-medical)
- Account sync / cloud save
- Accessibility audit (VoiceOver grid navigation)

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Expo dev server |
| `npm run android` / `ios` | Platform dev server |
| `npm run generate-assets` | Brand PNGs + sound WAVs |
| `npm run typecheck` | `tsc --noEmit` |

## License

See [LICENSE](./LICENSE).
