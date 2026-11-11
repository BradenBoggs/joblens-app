# 003 — Offline photo capture and upload

## What it is

The first connected workflow: sign in, pick a project, take photos, and get them into that project's Media. It works offline first. Crews often have no signal on site, so taking photos never needs the network, and photos upload by themselves when the phone has service again, even days later.

## Owns

- Sign-in with email, password and, when enabled, a two-factor code. The device token is kept in the Keychain or Keystore (`expo-secure-store`).
- The project list saved on the phone for use without signal.
- The native camera (`react-native-vision-camera`, JPEG photos) and the GPS fix recorded with each photo (`expo-location`).
- The local database of captures (`expo-sqlite`) and the photo files in the app's document folder.
- The upload queue: start, transfer, complete and status, using the Laravel mobile API.

Laravel owns accounts, project access, upload authorization, checking and storage. The API contract is documented in the main JobLens repository (`docs/features/mobile-api.md`).

## Should do

- Save every photo to the phone first and add it to the queue. The shutter never waits for the network.
- Keep each photo until the server says it is accepted, then delete the local copy.
- Upload right away on Wi-Fi or cellular whenever there is service: up to 6 photos at a time on Wi-Fi, 3 on cellular.
- Ask for an upload address only when sending (addresses expire after 15 minutes), refresh an expired one, and retry with backoff when the signal drops.
- Reuse each photo's idempotency key on every retry, so a retry never creates a duplicate.
- Show what is waiting, per project and on the Uploads tab, with Retry and Discard for photos JobLens rejected.
- Resume the queue on launch, when service returns, when the app comes to the foreground, and from a background task while the app is closed. iOS and Android decide when the background task runs.
- Warn when the phone is almost full, and confirm before signing out deletes photos that have not uploaded.

## Must not do

- Delete a photo that has not been accepted, except when the user discards it or confirms sign-out.
- Copy job photos into the phone's Photos app.
- Treat bytes sent to storage as accepted; only the server's status counts.
- Store the token anywhere other than secure storage.

## Current state

Implemented in the photo upload spike ([plan](../exec-plans/active/002-photo-upload-spike.md)). It needs a development build: the native camera doesn't run in Expo Go or the browser. Device testing has not happened yet.

Limits for now: photos only (no video), photos go straight to the project's Media (no collections, checklists or chat), GPS is kept on the phone and not yet sent to the server, and photos are JPEG because the server can't read HEIC until its Cloudflare image processor is on.
