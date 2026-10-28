# Werk-out mobile prototype

React Native + Expo SDK 54, intended for the App Store build of Expo Go on an iPhone.
This is an independent prototype UI within the openGym checkout; it does not yet
import the upstream training engine or connect to the openGym API.

## Run on your iPhone

In PowerShell:

```powershell
cd D:\Gab\Documents\apps\Werk-out\mobile
npm install
npx expo start --go
```

Connect the PC and iPhone to the same Wi-Fi. Open Expo Go, then scan the terminal's
QR code with the iPhone Camera app. Allow local-network access if iOS prompts.
If LAN access is blocked, try `npx expo start --go --tunnel`; Expo may prompt to
install its tunnel helper. Match the Expo account in the CLI and Expo Go if asked.

This project targets SDK 54 for the App Store Expo Go build described in Expo's
[compatibility guide](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/).
If your Expo Go was installed another way, verify its supported SDK before upgrading
the project. Do not upgrade dependencies individually to their latest versions.

## Try the prototype

- Today: mark habits and save an energy/sleep check-in.
- Train: start Upper body A, edit kg/reps, check sets, and finish the session.
- Close the session screen to browse other tabs; the session can be resumed.
- Progress: see locally saved workouts, set counts, and weekly completion.
- Coach: open Alex Morgan to see your member activity reflected in a coach review.
  The other clients are fictional examples. Review notes save locally and are not sent.
- Reload the app: AsyncStorage keeps sessions, check-ins, habits, and notes.

All workouts, clients, and weights are prototype examples. No licensed exercise
media are included. The rest timer is an on-screen countdown; there is no background
notification, HealthKit, Apple Watch, login, real client sharing, or server sync.
Keep the original repository LICENSE and NOTICE.md when sharing derivatives.

## Validation

```powershell
npx expo install --check
npx expo export --platform ios
npm run web
```

Web preview is useful for interaction checks but does not replace testing on iPhone.

Verified during setup on 28 October 2026:

- Expo dependency compatibility check passed using the installed SDK's version map
  (offline mode; no remote version check).
- iOS production export passed, including Hermes bytecode compilation.
- Browser interaction checks at 430 × 932 passed: check-in save, habit toggle,
  editable set logging, active-session restore after reload, completed workout
  history, linked coach summary, and review-note persistence.
- Physical iPhone testing remains to be done in Expo Go.

`npm audit` currently reports 10 inherited dependency advisories (5 low, 3 moderate,
2 high), including build-tool packages `image-size` and `postcss`. A compatible
`npm audit fix` was attempted; those advisories remain. Do not use `--force`:
the proposed Expo downgrade breaks the SDK 54 target. Reassess dependencies when
moving from this local prototype to a development build or release.
