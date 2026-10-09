# Engineering workflow

## Development

Use Node 22 LTS and `npm ci` from the repository root. Run the shell with `npm run start:go`, or use `npm start` after installing a development build. The foundation runs without any backend or account credentials. [README.md](../../README.md) owns setup and EAS instructions.

Use a focused branch for changes and preserve unrelated work. Add dependencies when an implemented feature requires them. For Expo/native modules, use `npx expo install <package>` to obtain compatible versions, review the manifest and lockfile, and run the compatibility check. Keep the SDK-supported Reanimated, Worklets, and Gesture Handler versions aligned even when these arrive through Router dependencies.

Do not add custom Metro/Babel configuration, native folders, app-state frameworks, or an API client without a concrete need. Validate a real backend contract before connecting a feature; an app route is not a server endpoint.

## Available checks

```bash
npm run check
CI=1 npm run check:dependencies
npm run doctor
CI=1 npm run export
```

On Windows PowerShell, set `$env:CI = '1'` before running the corresponding commands. CI performs a clean `npm ci` and the same checks with read-only repository permissions.

| Check                       | Establishes                                                                   | Does not establish                                 |
| --------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------- |
| TypeScript and ESLint       | Source types and static rules pass                                            | Correct server behavior                            |
| Prettier                    | Consistent source and document formatting                                     | UI quality                                         |
| Expo compatibility / Doctor | Configuration and dependency checks, subject to reported network availability | Native device acceptance                           |
| Expo export                 | Production JavaScript and assets bundle for the configured platforms          | A compiled or signed iOS/Android binary            |
| Web navigation smoke test   | The rendered shell opens and its navigation works in a browser                | Native gestures, permissions, or hardware behavior |

The initial shell has no domain logic or API requests, so it has no placeholder unit-test suite. Add focused tests alongside real state transitions, authorization handling, data mapping, or upload behavior. Do not install a test framework just to assert that a title exists.

## Device and integration checks

For the first device build, check Feed ↔ Projects navigation, account open/close, Android back, direct links, notches, rotation, and larger text on iOS and Android. Check final splash appearance in a preview or production build, since Expo Go and development clients have their own launch behavior. Verify screen-reader labels and visible focus where applicable. A successful web preview does not close these checks.

When project integration begins, verify authentication/revocation, organization/project isolation, loading versus unavailable states, and recovery from failed requests. Test capture and media-library permissions, original preservation, upload acceptance, and app interruption on devices when those features exist. Bytes transferred alone do not mean the server accepted an upload.

Report actual results and unresolved checks in the relevant execution record. Fix failures caused by the current change; avoid broadening work into unrelated cleanup. Store builds, deployment, and publishing are separate from source validation.
