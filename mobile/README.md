# Werk-out mobile prototype

React Native + Expo SDK 58. Requires Node.js 22.13+ on the Node 22 release line
(the development PC currently uses Node 22.18).
This is an independent prototype UI within the openGym checkout; it does not yet
import the upstream training engine or connect to the openGym API.

## Run on your iPhone

In PowerShell:

```powershell
cd D:\Gab\Documents\apps\Werk-out\mobile
npm ci
npx expo start --go --clear
```

Connect the PC and iPhone to the same Wi-Fi. Open Expo Go, then scan the terminal's
QR code with the iPhone Camera app. Allow local-network access if iOS prompts.
If LAN access is blocked, try `npx expo start --go --tunnel`. SDK 58's tunnel
requires signing in with `npx expo login`. Match the Expo account in the CLI and
Expo Go if asked.

Use an Expo Go build that explicitly supports SDK 58. Expo's
[SDK 58 release notes](https://expo.dev/changelog/sdk-58) state that the matching
App Store build is rolling out after the SDK release. An older Expo Go build
cannot open this project, even if you clear Metro's cache.

If the matching version is not yet available on your iPhone, use a compatible
TestFlight build via Expo's documented `eas go` workflow or a development build;
the documented iPhone signing/distribution workflow needs an Apple Developer
Program membership. See the
[compatibility guide](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/).
This repository does not configure or submit a cloud build automatically.
Do not upgrade dependencies individually to their latest versions; use
`npx expo install --fix` to align them with SDK 58.

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

SDK 58 upgrade verification on 28 October 2026:

- Expo 58.0.20, React Native 0.88.0, and React / React DOM 19.3.0 installed.
- `expo-font` declared directly, and font/status-bar config plugins added by Expo.
- Online `npx expo install --check` passed.
- `npx expo-doctor` passed all 20 checks.
- iOS production export passed, including Hermes bytecode compilation.
- Web production export passed.
- Browser smoke test passed: Today and Train render, coach review opens, and
  existing local workout/check-in/review data survives the upgrade. No browser
  console errors were recorded during that check.
- Physical iPhone testing still requires an SDK 58-compatible client.
- `npm audit` reports 8 dependency advisories (5 low, 3 high). This upgrade does
  not claim a clean security audit; review them before distributing a release.

Original SDK 54 prototype verification on 28 October 2026 (before the SDK upgrade):

- Expo dependency compatibility check passed using the installed SDK's version map
  (offline mode; no remote version check).
- iOS production export passed, including Hermes bytecode compilation.
- Browser interaction checks at 430 × 932 passed: check-in save, habit toggle,
  editable set logging, active-session restore after reload, completed workout
  history, linked coach summary, and review-note persistence.
- Physical iPhone testing remains to be done in Expo Go.

Run `npm audit` against the installed SDK 58 lockfile for the current dependency
report. Do not use `npm audit fix --force` to change Expo SDK versions implicitly.
