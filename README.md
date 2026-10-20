# Stack Rush

A tap-timing stack game built with **Expo** (SDK 58) and **TypeScript**. Tap when the moving block aligns with the tower — mis-cut and the run ends. Earn a **rewarded continue once per run**, see a **banner** on the menu and game over screens, and after runs of **30+ seconds** an **interstitial** may show on game over.

## Quick start

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** for core gameplay. **Google Mobile Ads require a development build** (not Expo Go):

```bash
npx expo prebuild
npx expo run:ios
# or
npx expo run:android
```

## Ads (development)

This repo uses **Google’s official test App IDs and ad unit IDs** via `react-native-google-mobile-ads` `TestIds` (see `src/constants/ads.ts` and `app.json` plugin config).

- **Banner** — main menu and game over only  
- **Interstitial** — game over when the current run lasted ≥ 30 seconds  
- **Rewarded** — optional continue once per run on game over  

## Production AdMob setup

Before shipping:

1. Create an app in [Google AdMob](https://admob.google.com/) for iOS and Android.
2. Replace test IDs in `app.json` plugin `androidAppId` / `iosAppId` with your real AdMob **application** IDs (`ca-app-pub-xxxxxxxx~yyyyyyyy`).
3. Replace unit IDs in `src/constants/ads.ts` with your production **ad unit** IDs for banner, interstitial, and rewarded.
4. Rebuild native projects after changing `app.json` (`npx expo prebuild --clean` then `run:ios` / `run:android`).

## App Store & privacy

- Declare **advertising** and third-party SDK data collection in App Store Connect **App Privacy** and Google Play **Data safety** (AdMob may collect device/ad identifiers for ad delivery and measurement).
- Add or update **NSUserTrackingUsageDescription** on iOS if you enable App Tracking Transparency for personalized ads (`app.json` includes a starter string).
- Link your **privacy policy** in store listings; describe ad partners and user choices (limit ad tracking / consent where required, e.g. GDPR, COPPA if targeting children).
- Use **SKAdNetwork** / Google’s latest AdMob iOS guidance; the sample `SKAdNetworkItems` entry in `app.json` is not exhaustive — merge AdMob’s recommended list for production.

## Project layout

- `App.tsx` — navigation between menu, gameplay, and game over  
- `src/components/` — UI and ad banner  
- `src/game/` — stack alignment logic  
- `src/hooks/useAds.ts` — interstitial and rewarded helpers  
- `src/storage/bestScore.ts` — persisted best score  

## Scripts

| Command | Description |
|--------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Expo + Android |
| `npm run ios` | Expo + iOS |
| `npm run web` | Web preview (ads disabled on web) |
