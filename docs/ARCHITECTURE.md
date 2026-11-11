# Architecture

## Purpose

JobLens mobile provides project work on iOS and Android. The Expo app owns native interaction and presentation. The Laravel application owns business rules, authorization, organization boundaries, and durable project data.

The starting implementation is an unconnected navigation shell. It has a Feed tab, a Projects tab, and an account screen for identity and access context. The account screen is not an organization administration area.

## Source layout

| Location           | Responsibility                                                   |
| ------------------ | ---------------------------------------------------------------- |
| `src/app/`         | Expo Router routes and navigation layouts                        |
| `src/features/`    | Feature screens and feature-specific presentation or interaction |
| `src/components/`  | UI components shared by implemented screens                      |
| `src/theme/`       | Shared colors, spacing, typography, and other design tokens      |
| `docs/features/`   | Feature purpose, ownership, behavior, and current state          |
| `docs/exec-plans/` | Focused implementation plans and completion records              |

Use Expo, React Native, React, and strict TypeScript. Start with local state, `StyleSheet`, and straightforward functions. Add integration code and dependencies when a feature needs them; do not prebuild empty feature folders or generic service and repository layers.

## Client and server ownership

| Concern                     | Mobile app owns                                                       | Laravel owns                                                                        |
| --------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Identity and access         | Sign-in UI and permitted context selection when supported             | Authentication contract, membership, and authorization for every operation          |
| Project work                | Navigation, forms, selection, and clear operation states              | Project records, validation, permissions, and durable changes                       |
| Capture                     | Native camera and photo-library interaction, permission explanations  | Acceptance rules for submitted media                                                |
| Upload                      | Transfer to a server-authorized destination and user-visible progress | Media creation, signed upload authorization, completion verification, and ingestion |
| Gallery and collections     | Browsing, selection, and presentation                                 | Media/collection records and allowed relationships                                  |
| Markup                      | Editing interaction and submitting the result                         | Persistence and association of the result while preserving the original             |
| Media lifecycle             | Displaying the server's state and available actions                   | Private storage, originals, processing, derivatives, retention, and deletion rules  |
| Sharing and upload requests | Creating and managing permitted project links or requests             | Link access, request rules, expiry, and contribution authorization                  |

Capture produces a local file. Upload transfers an authorized file. A gallery presents server media. Keep those responsibilities separate while reusing the same backend ingestion path and resource identifiers.

## Integration boundary

The app uses the Laravel mobile API at `/api/v1` with a per-device Sanctum token (see `docs/features/mobile-api.md` in the main JobLens repository). The backend's web session and Inertia workflows are not a mobile API, and the app must not call guessed endpoints or simulate authentication.

When connecting a feature, first verify its backend contract, authorization, request/response shape, and error behavior. Keep URLs and environment-specific values in configuration. Never place storage credentials, server secrets, or permanent access tokens in app configuration or the repository. Choose secure credential storage when the authentication flow is implemented.

For media, the intended flow is: obtain server authorization, transfer directly to the signed private-storage destination, then ask the server to verify completion. Laravel runs the shared ingestion and background processing path. Preserve original files; server-generated previews are separate assets. Signed URLs are temporary access details, not permanent resource identifiers.

Photo capture is offline first: photos and their upload state live in a local SQLite database until the server accepts them ([003](features/003-offline-photo-capture.md)). Push notifications and video transcoding are not built yet.

See [project work](features/002-project-work.md) for product scope and [app foundation](features/001-app-foundation.md) for the current implementation boundary.
