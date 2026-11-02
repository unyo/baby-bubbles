# Chloe's Bubbles (Expo app)

Wraps `../index.html` in a WebView so the game gets real haptics from
`expo-haptics` (the Taptic Engine on iPhone, the vibration motor on Android).
Safari can't do that from a web page.

## Run it

```sh
cd expo
npm install
npm start        # embeds ../index.html, then starts the Expo dev server
```

Scan the QR code with the Expo Go app (iPhone camera, or Expo Go on Android).
Use `npm start`, not `npx expo start`, so the latest `index.html` gets embedded.

## How haptics work

`buzz()` in `index.html` checks for `window.ReactNativeWebView`. Inside the app it
posts `{ type: 'haptic', kind, count, gap }` to native code, and `App.js` plays:

| kind    | when                 | haptic                    |
|---------|----------------------|---------------------------|
| `tap`   | tap on empty space   | light impact              |
| `trail` | finger dragging      | selection tick            |
| `pop`   | bubble popped        | medium impact             |
| `shake` | phone shaken         | heavy impact, 1 to 4 times |
| `start` | start button         | success notification      |

In a normal browser the old fallback still runs (the iOS switch-click trick and
`navigator.vibrate`).

## Build for the App Store

You need an Apple Developer account ($99/year) and a free Expo account. No Mac
needed, EAS builds in the cloud.

```sh
npm i -g eas-cli
cd expo
eas login
eas init                       # links this folder to an Expo project (one time)
eas build -p ios --profile production
eas submit -p ios              # uploads to App Store Connect / TestFlight
```

`npm install` (which EAS runs) embeds `../index.html` automatically, so the
build always ships the current game. The bundle ID is `com.unyo.chloesbubbles`
in `app.json`; change it before the first build if you want a different one.
Build numbers increase automatically (`eas.json`).

## Animal unlock (in-app purchase)

Bears are free. A one-time purchase unlocks a cat, bunny, frog, pig and chick.
The "Grown-ups: more animals" button on the start screen opens a parental gate
(a times-table question), then the unlock and Restore Purchase buttons.

In App Store Connect:

1. Accept the Paid Apps agreement and fill in banking and tax info.
2. Under the app, add an In-App Purchase of type **Non-Consumable** with
   product ID `com.unyo.chloesbubbles.friends` (see `store.js`), a $4.99 price,
   a display name, and a review screenshot of the unlock screen.
3. Attach the purchase to your first app version when you submit it.

To test purchases, use a TestFlight build or a development build
(`eas build --profile preview`); Expo Go has no store. In Expo Go the unlock
screen shows a "Preview animals" button instead so you can see them.
In a browser, add `?friends=1` to the URL to preview the animals.

## App Store submission checklist

Legal and listing items, in the order App Store Connect asks for them:

- **Name:** Chloe's Bubbles. Creating the app in App Store Connect reserves it.
- **Privacy policy URL:** https://unyo.github.io/chloes-bubbles/docs/privacy.html
- **Support URL:** https://unyo.github.io/chloes-bubbles/docs/
  (both served by GitHub Pages from `docs/`; contact: cody.moniz@gmail.com).
  The policy is also shown inside the app on the grown-up screen.
- **App Privacy ("nutrition label"):** choose **Data Not Collected**. The app
  has no analytics, ads, accounts or network calls, and
  `app.json > ios.privacyManifests` declares no tracking.
- **Age rating / Kids category:** answer "None" to every content question. If you
  pick the Kids category (ages 5 and under), the rules it adds are already met:
  no third-party analytics or ads, no links out, and purchases sit behind a
  parental gate.
- **Terms of use:** Apple's standard EULA covers this; no custom terms needed.
- **Refunds:** handled by Apple (support page links to reportaproblem.apple.com).
- **In-app purchase:** non-consumable `com.unyo.chloesbubbles.friends`, with
  Restore Purchase in the app.
- **Export compliance:** already answered in `app.json`
  (`usesNonExemptEncryption: false`).
- **Screenshots and description:** describe only what the app does; avoid
  claims like "educational" or "improves development" unless you can back them.
