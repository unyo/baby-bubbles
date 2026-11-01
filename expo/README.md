# Baby Bubbles in Expo Go

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
build always ships the current game. The bundle ID is `com.unyo.babybubbles`
in `app.json`; change it before the first build if you want a different one.
Build numbers increase automatically (`eas.json`).
