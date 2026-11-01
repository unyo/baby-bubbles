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
