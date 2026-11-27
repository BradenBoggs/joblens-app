# Working with the JobLens API

Laravel owns business rules, permissions and data. The app calls the Laravel API at `/api/v1` with a per-device token and presents what the server returns.

## Contract first

- Call only endpoints that exist in the Laravel repository's `routes/api.php`. When a feature needs a new or changed endpoint, that change lands in the Laravel repository first and the app PR links it.
- Make every call through `apiRequest` in `src/lib/api.ts`. Type each response in the feature that uses it, matching the server's fields. Ignore fields the app does not use.
- Use the server's public ids. Never invent an id for something the server has not accepted.

## Rules stay on the server

Don't recreate permission, plan or limit checks in the app. Send the request and show the server's answer. The app may hide a control when the server says it isn't allowed, but the server still decides.

Handle Laravel's standard errors the same way everywhere:

| Status    | Meaning                               | App behavior                             |
| --------- | ------------------------------------- | ---------------------------------------- |
| 0         | No connection                         | Keep the work queued and retry later     |
| 401       | Token revoked or expired              | Sign out on this device                  |
| 403 / 404 | Not allowed, or not in this workspace | Show that it is unavailable; don't retry |
| 422       | Validation failed                     | Show the field messages from `errors`    |
| 429 / 5xx | Rate limited or server error          | Retry later with backoff                 |

## Tokens and configuration

- The sign-in token is stored only in `expo-secure-store` (`src/features/auth/token-store.ts`), never in SQLite, logs, error reports or app configuration.
- `EXPO_PUBLIC_*` variables are written into the app bundle in plain text, so they hold public settings such as the server address and never secrets.
- Sign out revokes the token on the server and then clears it on the device.

## Old app versions

Installed builds keep running old code. The server keeps `/api/v1` additive, and the app must keep working when the server adds fields. If the app needs a field removed or its meaning changed, plan it in the Laravel repository as a new API version.

## Features that span both repositories

- Plan the feature in the Laravel repository, which is private. This repository is public, so don't copy backend plans, private docs or customer data here. Describe what the app does in [feature documents](../features/README.md).
- Order: the API PR in the Laravel repository first, then the app PR here, linking it. Merge the app PR only once its API is on the server the app points at.

## Tests

- When a change adds real logic (upload queue steps, response mapping, error handling), add focused tests with `jest-expo`, Expo's documented Jest preset (`npx expo install jest-expo jest @types/jest --dev` with the first test).
- Run `npm run check` and the tests you touched. GitHub Actions is not relied on because of cost; list what you ran in the PR.
- List the device checks still needed (camera, offline capture, background upload, sign-out) in the PR rather than marking them done.
