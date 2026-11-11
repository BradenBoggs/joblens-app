# JobLens mobile

The Expo app for project work in JobLens, starting with iOS and Android.

**Current state:** sign-in, a project list saved for offline use, a native camera, and an offline upload queue ([003](docs/features/003-offline-photo-capture.md)). The Feed tab is still unconnected. Device testing has not happened yet.

## Run locally

Use **Node.js 22 LTS, version 22.13 or newer**, and npm. The repository includes `.nvmrc` for environments with nvm.

```bash
npm ci
cp .env.example .env   # set EXPO_PUBLIC_API_URL to the JobLens server
npm start
```

The camera is native code, so the app needs a development build (see Native builds below); it doesn't run in Expo Go or a browser. Your phone must be able to reach the development server and the JobLens server.

`EXPO_PUBLIC_API_URL` is the only setting. It is public and built into the app, so it must never hold a secret.

| Command                      | Purpose                                                                    |
| ---------------------------- | -------------------------------------------------------------------------- |
| `npm run start:go`           | Start in Expo Go (the camera and local database need a development build)  |
| `npm start`                  | Start Metro; with `expo-dev-client` installed, targets a development build |
| `npm run android`            | Open the development server on an available Android emulator/device        |
| `npm run ios`                | Open the development server in an iOS simulator on macOS                   |
| `npm run check`              | TypeScript, ESLint, and formatting checks                                  |
| `npm run check:dependencies` | Verify Expo SDK dependency compatibility                                   |
| `npm run doctor`             | Check Expo project health, including remote compatibility checks           |
| `npm run export`             | Create production JavaScript/asset bundles for iOS and Android             |
| `npm run format`             | Apply Prettier formatting                                                  |

The `android` and `ios` commands launch an already installed app; they do not compile a native binary.

## Initial product scope

The dashboard is a **feed of recent project updates**. Project workflows will cover projects, media capture/upload and management, completing checklists, collections, markup, sharing, and upload requests. Checklist creation and template management stay in the desktop app. Billing, organization administration, and unrelated business features are outside this app's scope.

See [project work](docs/features/002-project-work.md) for the approved scope and [app foundation](docs/features/001-app-foundation.md) for what is implemented now. The app uses the Laravel mobile API (`/api/v1`, Sanctum tokens); it doesn't call web-session or Inertia endpoints.

## Source organization

| Path                  | Purpose                                                         |
| --------------------- | --------------------------------------------------------------- |
| `src/app/`            | Expo Router navigation and thin route entries                   |
| `src/features/`       | Screens and behavior belonging to implemented features          |
| `src/components/`     | Small components shared by those screens                        |
| `src/theme/tokens.ts` | Colors, typography, spacing, and layout values                  |
| `assets/brand/`       | Existing JobLens brand artwork                                  |
| `docs/`               | Architecture, UI guidance, feature scope, and execution records |

Start agent work at [AGENTS.md](AGENTS.md). Use [docs/INDEX.md](docs/INDEX.md) to find a document rather than reading the entire tree for every change.

## Native builds

`eas.json` contains standard development, preview, and production profiles. `expo-dev-client` is installed for the development profile. No EAS project, signing credentials, store application, or update channel has been registered by this initialization.

When you are ready to connect your Expo account:

```bash
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build:configure
npx eas-cli@latest build --profile development --platform android
# On a separate run, build iOS after configuring Apple signing:
npx eas-cli@latest build --profile development --platform ios
```

These are later account/build operations, not prerequisites for the shell. The initial bundle/package identifier is `io.joblens.app` and the URL scheme is `joblens`; verify identifiers before registering store apps. Install a development build, then use `npm start` for daily work.

Native `ios/` and `android/` directories are generated through Expo Continuous Native Generation and are not committed. Make native configuration changes through app configuration and supported config plugins. Camera and location permissions are declared in `app.json` for photo capture.

## Verification and references

[Engineering workflow](docs/engineering/WORKFLOW.md) describes the checks and their limits. The GitHub Actions workflow runs them on pull requests and changes to `main`; it does not build signed binaries or publish releases.

This foundation uses Expo SDK 58, React Native 0.88.1, React 19.3.0, and TypeScript 6. `package.json` and the committed npm lockfile own the exact dependency versions.

- [Expo project setup](https://docs.expo.dev/get-started/create-a-project/)
- [Expo SDK compatibility](https://docs.expo.dev/versions/latest/)
- [EAS build profiles](https://docs.expo.dev/build/eas-json/)
- [Continuous Native Generation](https://docs.expo.dev/workflow/continuous-native-generation/)
- [Public environment variables](https://docs.expo.dev/guides/environment-variables/)
