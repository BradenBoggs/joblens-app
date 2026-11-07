# 002 — Photo upload spike

## Goal

Prove that an Expo app can take photos offline and upload them reliably, which is JobLens's core product. The full plan, test list and decision gate are in Braden's plan document; this record tracks the work in this repository.

## Decisions (Braden, Nov 7 2026)

- Offline first: photos are taken without service and upload later by themselves.
- Email and password sign-in for now, on all plans.
- Upload right away whenever there is service, on Wi-Fi or cellular.
- Photos go straight to the project's Media, with no collection.
- Photos are kept in the app's own storage, not the Photos app.
- Test phone: iPhone 16 Pro Max; a mid-range Android for comparison.

## Dependencies

- The Laravel mobile API (`/api/v1`, Sanctum) from the main JobLens repository, PR #89, deployed to staging.
- `EXPO_PUBLIC_API_URL` pointing at that server.
- An Expo account, and an Apple Developer account for iPhone builds (Braden is getting the D-U-N-S number).

## Steps

1. Done: sign-in, secure token storage and the saved project list.
2. Done: camera capture into the local database, GPS and the waiting count.
3. Done: the upload queue (start, transfer, refresh, complete, status), retry with backoff, restart recovery, background task, storage warning, and the Uploads tab.
4. To do: first EAS development builds (Android first, iPhone once the Apple account is active).
5. To do: run the device tests in the plan, fix what fails, and record results here.

## Checks

| Check                                     | Result                                        |
| ----------------------------------------- | --------------------------------------------- |
| `npm run check` (types, lint, formatting) | Passed                                        |
| `expo install --check`                    | Passed (offline mode)                         |
| iOS and Android export bundles            | Passed                                        |
| Device tests                              | Not run: needs a development build on a phone |

The web preview was removed: the native camera and local SQLite database don't run in the browser.
